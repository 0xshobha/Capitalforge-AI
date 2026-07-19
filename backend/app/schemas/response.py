from typing import Optional

from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    innovation_score: float = Field(..., ge=0, le=10)
    market_score: float = Field(..., ge=0, le=10)
    competition_score: float = Field(..., ge=0, le=10)
    business_model_score: float = Field(..., ge=0, le=10)
    execution_score: float = Field(..., ge=0, le=10)
    investment_score: float = Field(..., ge=0, le=10)
    fundability_score: float = Field(..., ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    investment_verdict: Optional[str] = None


class AnalyzeResponse(BaseModel):
    transcript: str
    analysis: AnalysisResult
    investment_memo: str
    executive_summary: str
    audio: Optional[str] = None
    message: Optional[str] = None
