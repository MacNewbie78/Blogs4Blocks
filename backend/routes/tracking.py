from datetime import datetime, timezone
from fastapi import APIRouter
from fastapi.responses import Response, RedirectResponse
from database import db

router = APIRouter()


@router.get("/track/open")
async def track_email_open(d: str, e: str):
    await db.email_events.insert_one({
        "digest_id": d,
        "email_hash": e,
        "event_type": "open",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return Response(content=pixel, media_type="image/png", headers={"Cache-Control": "no-cache, no-store"})


@router.get("/track/click")
async def track_email_click(d: str, e: str, url: str):
    await db.email_events.insert_one({
        "digest_id": d,
        "email_hash": e,
        "event_type": "click",
        "url": url,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    return RedirectResponse(url=url)
