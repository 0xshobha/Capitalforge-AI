# CapitalForge AI

Real-time AI startup due diligence: speak a pitch → Whisper transcript → GPT analysis + investment memo → ElevenLabs spoken summary.

Hackathon MVP — live audio only. No auth, no database, no mock data.

## Stack

- **Frontend:** Next.js 15 + TypeScript + TailwindCSS (`frontend/`, port **3000**)
- **Backend:** FastAPI + Python 3.11+ (`backend/`, port **8000**)
- **AI:** OpenAI Whisper (`whisper-1`), GPT (`gpt-4o-mini`), ElevenLabs TTS (optional soft-fail)

## Quick start

### 1. Backend

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
# Edit .env and set OPENAI_API_KEY (required for /api/analyze)
# ELEVENLABS_API_KEY is optional — TTS soft-skips if missing
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Health check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Frontend

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:8000`.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| POST | `/api/analyze` | Multipart form field `audio` → transcript, scores, memo, summary, audio |

Response shape:

```json
{
  "transcript": "...",
  "analysis": {
    "innovation_score": 0,
    "market_score": 0,
    "competition_score": 0,
    "business_model_score": 0,
    "execution_score": 0,
    "investment_score": 0,
    "fundability_score": 0,
    "strengths": [],
    "weaknesses": [],
    "risks": [],
    "recommendations": [],
    "investment_verdict": "..."
  },
  "investment_memo": "...",
  "executive_summary": "...",
  "audio": "data:audio/mpeg;base64,... or null",
  "message": "optional ElevenLabs soft-fail note"
}
```

**Fundability (0–100):** weighted average of the six GPT scores (0–10), then ×10. Weights live in `backend/app/services/analysis.py`.

## Env vars

| Variable | Required | Notes |
|----------|----------|--------|
| `OPENAI_API_KEY` | Yes for analyze | Whisper + GPT |
| `ELEVENLABS_API_KEY` | No | Soft-skip TTS if unset |
| `ELEVENLABS_VOICE_ID` | No | Defaults to Rachel voice |
| `NEXT_PUBLIC_API_URL` | No | Default `http://localhost:8000` |

## Notes

- Use **Python 3.11–3.13** (3.14 may fail on some pinned wheels).
- Browser needs mic permission for recording.
- Without `OPENAI_API_KEY`, the API starts but `/api/analyze` returns a clear error.
