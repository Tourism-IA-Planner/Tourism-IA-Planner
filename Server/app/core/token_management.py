from typing import Set, Dict
from datetime import datetime, UTC
import logging
import threading
from jose import jwt
from app.core.config import settings

logger = logging.getLogger(__name__)


class TokenManager:
    def __init__(self):
        self._invalid_tokens: Set[str] = set()
        self._user_tokens: Dict[int, Set[str]] = {}
        self._lock = threading.Lock()

    def _extract_token_expiry(self, token: str) -> datetime:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            exp = payload.get('exp')
            if exp:
                return datetime.fromtimestamp(exp, UTC)
        except Exception as e:
            logger.error(f"Error extracting token expiry: {e}")
        return datetime.now(UTC)

    def invalidate_token(self, token: str, user_id: int = None) -> None:
        """Invalidate a token and store it with its expiry time"""
        with self._lock:
            self._invalid_tokens.add(token)
            if user_id:
                if user_id not in self._user_tokens:
                    self._user_tokens[user_id] = set()
                self._user_tokens[user_id].add(token)
            logger.info(f"Token invalidated for user {user_id}")

    def is_token_invalid(self, token: str) -> bool:
        """Check if a token is in the invalid tokens set"""
        with self._lock:
            return token in self._invalid_tokens

    def clear_invalid_tokens(self) -> None:
        """Clear expired tokens from the invalid tokens set"""
        current_time = datetime.now(UTC)
        with self._lock:
            valid_tokens = set()
            for token in self._invalid_tokens:
                try:
                    expiry = self._extract_token_expiry(token)
                    if expiry > current_time:
                        valid_tokens.add(token)
                except Exception:
                    continue
            self._invalid_tokens = valid_tokens
            logger.info("Expired tokens cleared")

    def invalidate_all_user_tokens(self, user_id: int) -> None:
        """Invalidate all tokens for a specific user"""
        with self._lock:
            if user_id in self._user_tokens:
                for token in self._user_tokens[user_id]:
                    self._invalid_tokens.add(token)
                logger.info(f"All tokens invalidated for user {user_id}")


# Create a singleton instance
token_manager = TokenManager()