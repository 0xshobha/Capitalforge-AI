from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Always load backend/.env regardless of process cwd
BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_ROOT / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE) if ENV_FILE.exists() else None,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    elevenlabs_api_key: str = ""
    # Rachel — default public voice from ElevenLabs docs
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    whisper_model: str = "whisper-1"
    gpt_model: str = "gpt-4o-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()


def has_openai_key() -> bool:
    key = (get_settings().openai_api_key or "").strip()
    if not key:
        return False
    # Treat .env.example placeholders as unset
    if "your-openai-key" in key.lower() or key.endswith("-here"):
        return False
    return True


def has_elevenlabs_key() -> bool:
    key = (get_settings().elevenlabs_api_key or "").strip()
    return bool(key)
