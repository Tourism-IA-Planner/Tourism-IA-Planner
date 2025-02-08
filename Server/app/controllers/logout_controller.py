# app/controllers/logout_controller.py
from fastapi import APIRouter, Depends, Response, Request, BackgroundTasks
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.controllers.auth_controller import get_current_user
from app.db.models import User
from app.core.token_management import token_manager
from app.core.error_handler import error_handler
from typing import Dict, Optional
from datetime import datetime,UTC
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
security = HTTPBearer()

async def cleanup_expired_tokens():
    """Background task to clean up expired tokens from the blacklist"""
    try:
        logger.info("Running token cleanup task")
        token_manager.clear_invalid_tokens()
    except Exception as e:
        logger.error(f"Error in token cleanup task: {str(e)}")

def log_logout_event(user_id: int, success: bool, error: Optional[str] = None):
    """Log logout events for audit purposes"""
    try:
        event = {
            "event": "logout",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat(),
            "success": success
        }
        if error:
            event["error"] = error
        logger.info(f"Logout event: {event}")
    except Exception as e:
        logger.error(f"Error logging logout event: {str(e)}")

@router.post("/logout", response_model=Dict[str, str])
async def logout(
    request: Request,
    response: Response,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Extract token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            error_handler.raise_validation_error(
                detail="Invalid authorization header",
                code="INVALID_AUTH_HEADER"
            )

        token = auth_header.split(' ')[1]

        # Invalidate the token
        token_manager.invalidate_token(token, current_user.id)

        # Clear cookies with secure flags
        response.delete_cookie(
            key="access_token",
            path="/",
            secure=True,
            httponly=True,
            samesite="strict"
        )

        # Set security headers
        response.headers.update({
            "Clear-Site-Data": '"cookies", "storage", "cache", "executionContexts"',
            "Cache-Control": "no-cache, no-store, must-revalidate, private",
            "Pragma": "no-cache",
            "Expires": "0"
        })

        # Log event
        background_tasks.add_task(log_logout_event, current_user.id, True)

        logger.info(f"User {current_user.id} logged out successfully")

        return {
            "message": "Successfully logged out",
            "status": "success",
            "timestamp": datetime.now(UTC).isoformat()
        }

    except Exception as e:
        logger.error(f"Logout error for user {current_user.id}: {str(e)}")
        background_tasks.add_task(log_logout_event, current_user.id, False, str(e))
        raise error_handler.raise_server_error(
            detail="Error during logout process",
            code="LOGOUT_ERROR",
            error=e
        )
@router.post("/logout/all-devices", response_model=Dict[str, str])
async def logout_all_devices(
        background_tasks: BackgroundTasks,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    """
    Logout user from all devices by invalidating all their active tokens

    Args:
        background_tasks: FastAPI BackgroundTasks for async operations
        current_user: Currently authenticated user
        db: Database session

    Returns:
        Dict with success message
    """
    try:
        # Add current user's tokens to blacklist
        token_manager.invalidate_all_user_tokens(current_user.id)

        # Schedule background tasks
        background_tasks.add_task(log_logout_event, current_user.id, True, "All devices logout")
        background_tasks.add_task(cleanup_expired_tokens)

        logger.info(f"User {current_user.id} logged out from all devices at {datetime.utcnow()}")

        return {
            "message": "Successfully logged out from all devices",
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"All devices logout error for user {current_user.id}: {str(e)}")
        background_tasks.add_task(log_logout_event, current_user.id, False, str(e))
        error_handler.raise_server_error(
            detail="Error during all-devices logout process",
            code="LOGOUT_ALL_DEVICES_ERROR",
            error=e
        )


@router.get("/logout/status", response_model=Dict[str, str])
async def check_logout_status(
        token: str,
        current_user: User = Depends(get_current_user)
):
    """
    Check if a specific token has been invalidated

    Args:
        token: The token to check
        current_user: Currently authenticated user

    Returns:
        Dict with token status
    """
    try:
        is_invalid = token_manager.is_token_invalid(token)
        return {
            "status": "invalid" if is_invalid else "valid",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        error_handler.raise_server_error(
            detail="Error checking token status",
            code="TOKEN_STATUS_ERROR",
            error=e
        )