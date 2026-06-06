from typing import Literal
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict


class UserOut(BaseModel):
    id:          int
    email:       str
    name:        str
    preferences: dict | None

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    email:    EmailStr
    name:     str
    password: str

    @field_validator("password")
    @classmethod
    def min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut


class PreferencesUpdate(BaseModel):
    preferences: dict


class PasswordResetRequest(BaseModel):
    email:        EmailStr
    new_password: str

    @field_validator("new_password")
    @classmethod
    def min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class VoteRequest(BaseModel):
    content_type: Literal["insight", "meme", "news", "coin_sentiment"]
    content_key:  str
    value:        Literal["up", "down"] | None
    category:     str | None = None


class VoteOut(BaseModel):
    content_type: str
    content_key:  str
    value:        str

    model_config = ConfigDict(from_attributes=True)
