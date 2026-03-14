import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from database import db
from auth import get_current_user
from models import CommentCreate
from email_service import notify_post_author_of_comment
from websocket_manager import ws_manager

router = APIRouter()


@router.get("/posts/{post_id}/comments")
async def get_comments(post_id: str):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return comments


@router.post("/posts/{post_id}/comments")
async def create_comment(post_id: str, comment: CommentCreate, user=Depends(get_current_user)):
    post = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    comment_doc = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "content": comment.content,
        "author_name": comment.author_name,
        "author_city": comment.author_city or (user["city"] if user else ""),
        "author_country": comment.author_country or (user["country"] if user else ""),
        "author_id": user["id"] if user else None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.comments.insert_one(comment_doc)
    # Track interaction
    if user:
        await db.user_interactions.update_one(
            {"user_id": user["id"], "post_id": post_id},
            {"$set": {"user_id": user["id"], "post_id": post_id, "type": "comment", "updated_at": datetime.now(timezone.utc).isoformat()}},
            upsert=True
        )
    # Real-time broadcast
    safe_comment = {k: v for k, v in comment_doc.items() if k != "_id"}
    await ws_manager.broadcast(post_id, {"type": "new_comment", "comment": safe_comment})
    # Email notification
    try:
        await notify_post_author_of_comment(post, comment_doc)
    except Exception:
        pass
    return safe_comment


@router.get("/posts/{post_id}/comments/live")
async def get_comments_live(post_id: str):
    comments = await db.comments.find({"post_id": post_id}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return comments
