from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db, User
from auth import get_current_user
from schemas import UserOut, PreferencesUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/preferences", response_model=UserOut)
def update_preferences(
    body: PreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.preferences = body.preferences
    db.commit()
    db.refresh(current_user)
    return current_user
