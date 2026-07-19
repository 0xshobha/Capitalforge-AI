import json
from typing import Any

from fastapi import HTTPException
from openai import OpenAI

from app.core.config import get_settings, has_openai_key
from app.schemas.response import AnalysisResult

# Fundability (0–100) = weighted average of the six 0–10 GPT scores × 10.
# Weights emphasize market, business model, and investment readiness.
SCORE_WEIGHTS = {
    "innovation_score": 0.15,
    "market_score": 0.20,
    "competition_score": 0.15,
    "business_model_score": 0.20,
    "execution_score": 0.15,
    "investment_score": 0.15,
}

SYSTEM_PROMPT = """You are a senior venture capital analyst at CapitalForge AI.
Analyze the founder's spoken startup pitch transcript.

Return ONLY valid JSON matching this schema (no markdown):
{
  "innovation_score": number 0-10,
  "market_score": number 0-10,
  "competition_score": number 0-10,
  "business_model_score": number 0-10,
  "execution_score": number 0-10,
  "investment_score": number 0-10,
  "strengths": string[],
  "weaknesses": string[],
  "risks": string[],
  "recommendations": string[],
  "investment_verdict": string,
  "investment_memo": string,
  "executive_summary": string
}

Rules:
- Scores MUST be grounded ONLY in the transcript. Do not invent facts not present or reasonably inferred.
- If the pitch is thin, give lower scores and say so in weaknesses/risks.
- investment_memo: institutional-style memo (several short paragraphs).
- executive_summary: 2-4 spoken sentences suitable for text-to-speech.
- investment_verdict: short label e.g. "Pass", "Watch", "Consider", "Strong Consider".
- Arrays: 2-5 concise bullet strings each.
"""


def compute_fundability(scores: dict[str, float]) -> float:
    """Weighted fundability 0–100 from six 0–10 dimension scores."""
    total = 0.0
    for key, weight in SCORE_WEIGHTS.items():
        total += float(scores[key]) * weight
    return round(total * 10, 1)


def _clamp_score(value: Any) -> float:
    try:
        n = float(value)
    except (TypeError, ValueError):
        n = 0.0
    return max(0.0, min(10.0, round(n, 1)))


async def analyze_transcript(transcript: str) -> tuple[AnalysisResult, str, str]:
    settings = get_settings()
    if not has_openai_key():
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured. Set a real key in backend/.env",
        )

    client = OpenAI(api_key=settings.openai_api_key)

    try:
        completion = client.chat.completions.create(
            model=settings.gpt_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Pitch transcript:\n\n{transcript}",
                },
            ],
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"GPT analysis failed: {exc}",
        ) from exc

    raw = completion.choices[0].message.content or "{}"
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail="GPT returned invalid JSON.",
        ) from exc

    score_keys = list(SCORE_WEIGHTS.keys())
    scores = {k: _clamp_score(data.get(k, 0)) for k in score_keys}
    fundability = compute_fundability(scores)

    def _str_list(key: str) -> list[str]:
        val = data.get(key) or []
        if not isinstance(val, list):
            return []
        return [str(x).strip() for x in val if str(x).strip()]

    memo = str(data.get("investment_memo") or "").strip()
    summary = str(data.get("executive_summary") or "").strip()
    if not memo or not summary:
        raise HTTPException(
            status_code=502,
            detail="GPT response missing investment_memo or executive_summary.",
        )

    verdict = data.get("investment_verdict")
    analysis = AnalysisResult(
        innovation_score=scores["innovation_score"],
        market_score=scores["market_score"],
        competition_score=scores["competition_score"],
        business_model_score=scores["business_model_score"],
        execution_score=scores["execution_score"],
        investment_score=scores["investment_score"],
        fundability_score=fundability,
        strengths=_str_list("strengths"),
        weaknesses=_str_list("weaknesses"),
        risks=_str_list("risks"),
        recommendations=_str_list("recommendations"),
        investment_verdict=str(verdict).strip() if verdict else None,
    )
    return analysis, memo, summary
