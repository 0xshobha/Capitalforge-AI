from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.response import AnalyzeResponse
from app.services.analysis import analyze_transcript
from app.services.speech import transcribe_audio
from app.services.voice import synthesize_speech

router = APIRouter(prefix="/api", tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(audio: UploadFile = File(...)):
    if audio is None:
        raise HTTPException(status_code=400, detail="Missing multipart field 'audio'.")

    content = await audio.read()
    if not content:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    filename = audio.filename or "recording.webm"
    transcript = await transcribe_audio(filename, content, audio.content_type)
    analysis, memo, summary = await analyze_transcript(transcript)
    audio_b64, tts_message = await synthesize_speech(summary)

    return AnalyzeResponse(
        transcript=transcript,
        analysis=analysis,
        investment_memo=memo,
        executive_summary=summary,
        audio=audio_b64,
        message=tts_message,
    )
