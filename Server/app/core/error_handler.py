# app/core/error_handler.py

from fastapi import HTTPException, status
from typing import Union, Dict, Any
import logging

logger = logging.getLogger(__name__)


class ErrorHandler:
    """Centralized error handling for the application"""

    @staticmethod
    def raise_auth_error(detail: str = "Authentication failed",
                         code: str = "AUTH_ERROR",
                         error: Exception = None) -> None:
        logger.error(f"Authentication error: {detail} - {str(error) if error else ''}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "message": detail,
                "code": code,
                "error": str(error) if error else None
            }
        )

    @staticmethod
    def raise_permission_error(detail: str = "Permission denied",
                               code: str = "PERMISSION_DENIED") -> None:
        logger.error(f"Permission error: {detail}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message": detail,
                "code": code
            }
        )

    @staticmethod
    def raise_not_found(detail: str = "Resource not found",
                        code: str = "NOT_FOUND") -> None:
        logger.error(f"Not found error: {detail}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "message": detail,
                "code": code
            }
        )

    @staticmethod
    def raise_validation_error(detail: str,
                               code: str = "VALIDATION_ERROR",
                               field: str = None) -> None:
        error_detail = {
            "message": detail,
            "code": code
        }
        if field:
            error_detail["field"] = field

        logger.error(f"Validation error: {detail} - Field: {field}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_detail
        )

    @staticmethod
    def raise_server_error(detail: str = "Internal server error",
                           code: str = "SERVER_ERROR",
                           error: Exception = None) -> None:
        logger.error(f"Server error: {detail} - {str(error) if error else ''}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": detail,
                "code": code,
                "error": str(error) if error else None
            }
        )

    @staticmethod
    def format_error_response(status_code: int,
                              message: str,
                              code: str,
                              errors: Union[str, Dict[str, Any]] = None) -> Dict[str, Any]:
        """Format error response consistently"""
        response = {
            "detail": {
                "message": message,
                "code": code
            }
        }
        if errors:
            response["detail"]["errors"] = errors
        return response


# Create a singleton instance
error_handler = ErrorHandler()