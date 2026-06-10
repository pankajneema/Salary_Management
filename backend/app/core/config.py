from pathlib import Path

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./acme_salary.db"
    FRONTEND_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    class Config:
        env_file = str(Path(__file__).resolve().parents[2] / ".env")

settings = Settings()
