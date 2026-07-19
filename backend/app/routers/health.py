from fastapi import APIRouter

from app.core.config import has_elevenlabs_key, has_openai_key

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "CapitalForge AI",
        "openai_configured": has_openai_key(),
        "elevenlabs_configured": has_elevenlabs_key(),
    }
