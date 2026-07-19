import base64
import logging

import httpx

from app.core.config import get_settings, has_elevenlabs_key

logger = logging.getLogger(__name__)

ELEVENLABS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"


async def synthesize_speech(text: str) -> tuple[str | None, str | None]:
    """
    ElevenLabs TTS soft-fail.
    Returns (audio_data_url_or_none, optional_message).
    Never raises — callers always get the rest of the analysis JSON.
    """
    settings = get_settings()
    if not has_elevenlabs_key():
        return None, "ElevenLabs skipped: ELEVENLABS_API_KEY not configured."

    if not text.strip():
        return None, "ElevenLabs skipped: empty executive summary."

    url = ELEVENLABS_URL.format(voice_id=settings.elevenlabs_voice_id)
    headers = {
        "xi-api-key": settings.elevenlabs_api_key,
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
    }
    payload = {
        "text": text[:2500],
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.75},
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
        if resp.status_code >= 400:
            msg = f"ElevenLabs soft-fail ({resp.status_code}): {resp.text[:200]}"
            logger.warning(msg)
            return None, msg

        b64 = base64.b64encode(resp.content).decode("ascii")
        return f"data:audio/mpeg;base64,{b64}", None
    except Exception as exc:
        msg = f"ElevenLabs soft-fail: {exc}"
        logger.warning(msg)
        return None, msg
