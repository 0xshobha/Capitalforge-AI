export type AnalysisResult = {
  innovation_score: number;
  market_score: number;
  competition_score: number;
  business_model_score: number;
  execution_score: number;
  investment_score: number;
  fundability_score: number;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  recommendations: string[];
  investment_verdict?: string | null;
};

export type AnalyzeResponse = {
  transcript: string;
  analysis: AnalysisResult;
  investment_memo: string;
  executive_summary: string;
  audio: string | null;
  message?: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export function getApiUrl(): string {
  return API_URL;
}

export async function analyzeAudio(blob: Blob, filename = "recording.webm"): Promise<AnalyzeResponse> {
  const form = new FormData();
  form.append("audio", blob, filename);

  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let detail = `Analysis failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.detail === "string") detail = data.detail;
      else if (Array.isArray(data?.detail)) {
        detail = data.detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join("; ");
      }
    } catch {
      // keep default
    }
    throw new Error(detail);
  }

  return res.json() as Promise<AnalyzeResponse>;
}
