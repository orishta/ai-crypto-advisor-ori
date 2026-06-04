import os
from dotenv import load_dotenv
from sqlalchemy import (
    Column, Integer, String, ForeignKey, DateTime, UniqueConstraint, create_engine,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, sessionmaker, relationship
from sqlalchemy.sql import func

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id          = Column(Integer, primary_key=True, index=True)
    email       = Column(String, unique=True, nullable=False, index=True)
    name        = Column(String, nullable=False, default="")
    hashed_pw   = Column(String, nullable=False, default="")
    preferences = Column(JSONB, nullable=True, default={})
    votes       = relationship("Vote", back_populates="user", cascade="all, delete-orphan")


class Vote(Base):
    __tablename__ = "votes"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content_type = Column(String, nullable=False)
    content_key  = Column(String, nullable=False)
    value        = Column(String, nullable=False)
    created_at   = Column(DateTime, server_default=func.now())
    user         = relationship("User", back_populates="votes")

    __table_args__ = (UniqueConstraint("user_id", "content_type", "content_key"),)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
