from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from database import get_db, Vote, User
from auth import get_current_user
from schemas import VoteRequest, VoteOut

router = APIRouter(prefix="/votes", tags=["votes"])


@router.get("", response_model=dict)
def get_votes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    votes = db.query(Vote).filter(Vote.user_id == current_user.id).all()
    return {"votes": [VoteOut.model_validate(v) for v in votes]}


@router.post("", status_code=status.HTTP_200_OK)
def upsert_vote(
    body: VoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.value is None:
        db.query(Vote).filter(
            Vote.user_id      == current_user.id,
            Vote.content_type == body.content_type,
            Vote.content_key  == body.content_key,
        ).delete()
    else:
        stmt = insert(Vote).values(
            user_id      = current_user.id,
            content_type = body.content_type,
            content_key  = body.content_key,
            value        = body.value,
        ).on_conflict_do_update(
            index_elements=["user_id", "content_type", "content_key"],
            set_={"value": body.value},
        )
        db.execute(stmt)

        if body.content_type == "meme" and body.value == "up" and body.category:
            prefs = dict(current_user.preferences or {})
            counters = dict(prefs.get("liked_meme_categories", {}))
            counters[body.category] = counters.get(body.category, 0) + 1
            prefs["liked_meme_categories"] = counters
            current_user.preferences = prefs

    db.commit()
    return {"status": "ok"}
