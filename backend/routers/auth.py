from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, User
from auth import hash_password, verify_password, create_access_token
from schemas import RegisterRequest, LoginRequest, TokenResponse, PasswordResetRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=body.email, name=body.name, hashed_pw=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id), user=user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email not registered")
    if not verify_password(body.password, user.hashed_pw):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong password")

    return TokenResponse(access_token=create_access_token(user.id), user=user)


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(body: PasswordResetRequest, db: Session = Depends(get_db)):
    """Developer-facing endpoint: resets a user's password directly by email."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Email not registered")
    user.hashed_pw = hash_password(body.new_password)
    db.commit()
    return {"detail": "Password updated successfully"}
