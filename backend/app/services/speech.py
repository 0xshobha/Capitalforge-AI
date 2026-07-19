import io
import re

from fastapi import HTTPException
from openai import OpenAI

from app.core.config import get_settings, has_openai_key

ALLOWED_EXTENSIONS = {
    ".webm",
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
    ".mpeg",
    ".mpga",
    ".oga",
    ".ogg",
    ".flac",
}
MAX_AUDIO_BYTES = 25 * 1024 * 1024  # Whisper limit


def _light_clean(text: str) -> str:
    """Light cleanup only — no paraphrasing."""
    text = text.strip()
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


async def transcribe_audio(filename: str, content: bytes, content_type: str | None) -> str:
    settings = get_settings()
    if not has_openai_key():
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured. Set a real key in backend/.env",
        )

    if not content:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    if len(content) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Audio file exceeds {MAX_AUDIO_BYTES // (1024 * 1024)}MB Whisper limit.",
        )

    lower = (filename or "audio.webm").lower()
    if "." in lower:
        ext = "." + lower.rsplit(".", 1)[-1]
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported audio format '{ext}'. Use webm, mp3, wav, m4a, or ogg.",
            )
    else:
        filename = f"{filename or 'audio'}.webm"

    client = OpenAI(api_key=settings.openai_api_key)
    buffer = io.BytesIO(content)
    buffer.name = filename

    try:
        result = client.audio.transcriptions.create(
            model=settings.whisper_model,
            file=buffer,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Whisper transcription failed: {exc}",
        ) from exc

    transcript = _light_clean(getattr(result, "text", "") or "")
    if not transcript:
        raise HTTPException(
            status_code=422,
            detail="Transcription produced empty text. Speak clearly and try again.",
        )
    return transcript
