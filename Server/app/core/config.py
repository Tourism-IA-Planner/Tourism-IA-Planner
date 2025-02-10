from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str

    OLLAMA_BASE_URL: str = "http://localhost:11434/api"
    OLLAMA_MODEL: str = "llama3.2:1b"
    OLLAMA_TIMEOUT: int = 120
    ########################################################################
    AI_API_KEY: str
    MAX_CONVERSATION_HISTORY: int = 5
    AI_MODEL: str = "gpt-3.5-turbo"  # or "gpt-4" if you prefer
    AI_MAX_TOKENS: int = 1000
    AI_TEMPERATURE: float = 0.7

    class Config:
        env_file = ".env"

# Create an instance of the Settings class
settings = Settings()