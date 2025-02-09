# app/controllers/google_auth_controller.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from datetime import timedelta
from pydantic import BaseModel

router = APIRouter()


class GoogleAuthRequest(BaseModel):
    token: str

# first user connect to google acc -> google returns the token auth_request.token   the foront end send the token to ther server
@router.post("/auth/google")
async def google_auth(auth_request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        #Step 1: Token Verification || verify_oauth2_token() function contacts Google and says "Hey, is this token valid for my application?"
        idinfo = id_token.verify_oauth2_token(
            auth_request.token,  # The token from Google
            requests.Request(),  # Request object for verification
            settings.GOOGLE_CLIENT_ID   # My app's client ID
        )

        # Validate required fields from Google token
        if 'email' not in idinfo:
            return {
                "status_code": status.HTTP_400_BAD_REQUEST,
                "detail": {
                    "message": "Email not found in Google token",
                    "code": "MISSING_EMAIL"
                }
            }

        # Step 2: Extract User Information
        email = idinfo['email']
        nom = idinfo.get('family_name', '')
        prenom = idinfo.get('given_name', '')

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            try:
                # Create new user if doesn't exist
                user = User(
                    email=email,
                    nom=nom,
                    prenom=prenom,
                    image=None,
                    image_type=None,
                    password=""
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            except Exception as db_error:
                db.rollback()
                return {
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "detail": {
                        "message": "Failed to create user account",
                        "code": "DATABASE_ERROR",
                        "error": str(db_error)
                    }
                }

        # Create access token
        try:
            access_token = create_access_token(
                data={
                    "sub": email,
                    "id": user.id
                },
                expires_delta=timedelta(minutes=30)
            )
        except Exception as token_error:
            return {
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "detail": {
                    "message": "Failed to create access token",
                    "code": "TOKEN_ERROR",
                    "error": str(token_error)
                }
            }

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "nom": user.nom,
                "prenom": user.prenom
            }
        }

    except ValueError as ve:
        return {
            "status_code": status.HTTP_401_UNAUTHORIZED,
            "detail": {
                "message": "Invalid Google token",
                "code": "INVALID_TOKEN",
                "error": str(ve)
            }
        }
    except Exception as e:
        return {
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "detail": {
                "message": "An error occurred during Google authentication",
                "code": "AUTH_ERROR",
                "error": str(e)
            }
        }