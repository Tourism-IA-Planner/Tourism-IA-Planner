# app/core/exception_handlers.py

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, HTTPException
import logging

logger = logging.getLogger(__name__)


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle validation exceptions from pydantic models
    """
    # Log the error
    logger.error(f"Validation Error: {str(exc)}")

    # Get the first error
    error = exc.errors()[0]

    # Extract field name from the location
    field = error["loc"][-1] if error["loc"] else "unknown"

    # Clean up the error message
    message = error["msg"]
    if message.startswith("Value error, "):
        message = message.replace("Value error, ", "")

    # Format the error detail in the desired structure
    error_detail = {
        'message': message,
        'code': f"INVALID_{field.upper()}",
        'field': field
    }

    # Return the response in the exact format requested
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": {
                "message": "Internal server error",
                "code": "SERVER_ERROR",
                "error": f"400: {error_detail}"
            }
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions
    """
    # Log the error
    logger.error(f"HTTP Exception: {exc.detail}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": {
                "message": "Internal server error",
                "code": "SERVER_ERROR",
                "error": f"400: {exc.detail}"
            }
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle generic exceptions
    """
    # Log the error
    logger.error(f"Generic Exception: {str(exc)}")

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": {
                "message": "Internal server error",
                "code": "SERVER_ERROR",
                "error": str(exc)
            }
        }
    )