from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator
import re

# Schema for user signup
class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    password: str

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'[a-z]', v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        return v

    @field_validator('nom', 'prenom')
    def validate_name(cls, v, field):
        if len(v.strip()) < 2:
            raise ValueError(f"{field.name.title()} must be at least 2 characters")
        if not v.strip().isalpha():
            raise ValueError(f"{field.name.title()} must contain only letters")
        return v.strip().title()

    class Config:
        orm_mode = True

# Schema for user login
class UserLogin(BaseModel):
    email: EmailStr  # Validate email format
    password: str

    class Config:
        orm_mode = True

# Schema for user output (excluding password)
class UserOut(BaseModel):
    id: int
    nom: str
    prenom: str
    email: EmailStr  # Return email in proper format

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None

    class Config:
        from_attributes = True


class PasswordUpdate(BaseModel):
    current_password: str = Field(
        ...,
        description="Current password",
        min_length=1
    )
    new_password: str = Field(
        ...,
        description="New password",
        min_length=8
    )
    confirm_password: str = Field(
        ...,
        description="Confirm new password",
        min_length=1
    )

    @field_validator('current_password')
    def validate_current_password(cls, v):
        if not v.strip():
            raise ValueError({
                "message": "Current password is required",
                "code": "CURRENT_PASSWORD_REQUIRED",
                "field": "current_password"
            })
        return v

    @field_validator('new_password')
    def validate_new_password(cls, v):
        if not v.strip():
            raise ValueError({
                "message": "New password is required",
                "code": "NEW_PASSWORD_REQUIRED",
                "field": "new_password"
            })

        if len(v) < 8:
            raise ValueError({
                "message": "Password must be at least 8 characters long",
                "code": "PASSWORD_TOO_SHORT",
                "field": "new_password"
            })

        if not re.search(r'[A-Z]', v):
            raise ValueError({
                "message": "Password must contain at least one uppercase letter",
                "code": "PASSWORD_NO_UPPERCASE",
                "field": "new_password"
            })

        if not re.search(r'[a-z]', v):
            raise ValueError({
                "message": "Password must contain at least one lowercase letter",
                "code": "PASSWORD_NO_LOWERCASE",
                "field": "new_password"
            })

        if not re.search(r'\d', v):
            raise ValueError({
                "message": "Password must contain at least one number",
                "code": "PASSWORD_NO_NUMBER",
                "field": "new_password"
            })

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError({
                "message": "Password must contain at least one special character",
                "code": "PASSWORD_NO_SPECIAL",
                "field": "new_password"
            })

        return v

    @field_validator('confirm_password')
    def validate_password_match(cls, v, values):
        if 'new_password' in values.data and v != values.data['new_password']:
            raise ValueError({
                "message": "Passwords do not match",
                "code": "PASSWORDS_DO_NOT_MATCH",
                "field": "confirm_password"
            })
        return v

    class Config:
        from_attributes = True