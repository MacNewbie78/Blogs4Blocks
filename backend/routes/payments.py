import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import db
from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse, CheckoutStatusResponse
)

router = APIRouter()

# ──────────────────────────────────────────
# Rate Card — prices defined server-side only
# ──────────────────────────────────────────
BASE_PRICES = {
    ("small", "1-run"):   100.00,
    ("small", "4-runs"):  360.00,
    ("small", "8-runs"):  640.00,
    ("medium", "1-run"):  175.00,
    ("medium", "4-runs"): 630.00,
    ("medium", "8-runs"): 1120.00,
    ("large", "1-run"):   300.00,
    ("large", "4-runs"):  1080.00,
    ("large", "8-runs"):  1920.00,
}

PLACEMENT_MULTIPLIERS = {
    "standard": 1.0,
    "premium":  1.25,
    "top-tier": 1.5,
}


class AdBookingRequest(BaseModel):
    ad_size: str
    frequency: str
    placement: str
    advertiser: str
    contact_name: str
    email: str
    phone: Optional[str] = ""
    campaign_name: Optional[str] = ""
    origin_url: str


@router.get("/payments/rate-card")
async def get_rate_card():
    """Public endpoint — returns the full rate card for the pricing UI."""
    prices = []
    for (size, freq), price in BASE_PRICES.items():
        prices.append({"ad_size": size, "frequency": freq, "base_price": price})
    multipliers = [{"placement": k, "multiplier": v} for k, v in PLACEMENT_MULTIPLIERS.items()]
    return {"prices": prices, "multipliers": multipliers}


@router.post("/payments/checkout")
async def create_ad_checkout(req: AdBookingRequest, http_request: Request):
    key = (req.ad_size.lower(), req.frequency.lower())
    if key not in BASE_PRICES:
        raise HTTPException(400, f"Invalid ad_size/frequency combination: {key}")
    placement = req.placement.lower()
    if placement not in PLACEMENT_MULTIPLIERS:
        raise HTTPException(400, f"Invalid placement: {placement}")

    base_price = BASE_PRICES[key]
    multiplier = PLACEMENT_MULTIPLIERS[placement]
    total = round(base_price * multiplier, 2)

    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(500, "Payment processing unavailable")

    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/advertise"

    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    booking_id = str(uuid.uuid4())[:8].upper()
    metadata = {
        "booking_id": booking_id,
        "ad_size": req.ad_size,
        "frequency": req.frequency,
        "placement": req.placement,
        "advertiser": req.advertiser,
        "contact_name": req.contact_name,
        "email": req.email,
    }

    checkout_req = CheckoutSessionRequest(
        amount=total,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_req)

    # Create payment transaction record
    tx = {
        "id": str(uuid.uuid4()),
        "booking_id": booking_id,
        "session_id": session.session_id,
        "advertiser": req.advertiser,
        "contact_name": req.contact_name,
        "email": req.email,
        "phone": req.phone,
        "campaign_name": req.campaign_name,
        "ad_size": req.ad_size,
        "frequency": req.frequency,
        "placement": req.placement,
        "base_price": base_price,
        "multiplier": multiplier,
        "total_price": total,
        "currency": "usd",
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(tx)

    return {"url": session.url, "session_id": session.session_id, "booking_id": booking_id, "total": total}


@router.get("/payments/status/{session_id}")
async def check_payment_status(session_id: str, http_request: Request):
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(500, "Payment processing unavailable")

    host_url = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    # Update transaction if exists and not already finalized
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if tx and tx.get("payment_status") not in ("paid", "completed"):
        new_status = "paid" if status.payment_status == "paid" else status.payment_status
        update = {
            "payment_status": new_status,
            "status": "completed" if new_status == "paid" else status.status,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update})

        # If paid, also create/update the ad booking record
        if new_status == "paid":
            await db.ad_bookings.update_one(
                {"booking_id": tx["booking_id"]},
                {"$set": {
                    "booking_id": tx["booking_id"],
                    "advertiser": tx["advertiser"],
                    "contact_name": tx["contact_name"],
                    "email": tx["email"],
                    "phone": tx.get("phone", ""),
                    "campaign_name": tx.get("campaign_name", ""),
                    "ad_size": tx["ad_size"],
                    "frequency": tx["frequency"],
                    "placement": tx["placement"],
                    "total_paid": tx["total_price"],
                    "payment_status": "paid",
                    "status": "booked",
                    "paid_at": datetime.now(timezone.utc).isoformat(),
                    "created_at": tx["created_at"],
                }},
                upsert=True,
            )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
        "metadata": status.metadata,
    }


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    api_key = os.environ.get("STRIPE_API_KEY")
    if not api_key:
        raise HTTPException(500, "Payment processing unavailable")

    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")

    try:
        event = await stripe_checkout.handle_webhook(body, sig)
        if event.payment_status == "paid":
            session_id = event.session_id
            tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
            if tx and tx.get("payment_status") != "paid":
                await db.payment_transactions.update_one(
                    {"session_id": session_id},
                    {"$set": {"payment_status": "paid", "status": "completed", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
        return {"status": "ok"}
    except Exception:
        return {"status": "ok"}


@router.get("/payments/bookings")
async def get_bookings():
    """Admin: list all ad bookings."""
    bookings = await db.ad_bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings
