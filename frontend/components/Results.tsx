"use client";

import type { AnalyzeResponse } from "@/lib/api";
import BulletList from "./BulletList";
import ScoreCard from "./ScoreCard";

type Props = {
  data: AnalyzeResponse;
};

const SCORE_LABELS: { key: keyof AnalyzeResponse["analysis"]; label: string }[] = [
  { key: "innovation_score", label: "Innovation" },
  { key: "market_score", label: "Market" },
  { key: "competition_score", label: "Competition" },
  { key: "business_model_score", label: "Business Model" },
  { key: "execution_score", label: "Execution" },
  { key: "investment_score", label: "Investment" },
];

export default function Results({ data }: Props) {
  const { analysis } = data;
  const audioSrc =
    data.audio && data.audio.startsWith("data:")
      ? data.audio
      : data.audio
        ? `data:audio/mpeg;base64,${data.audio}`
        : null;

  return (
    <div className="mt-10 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-forge-muted">Results</p>
          <h2 className="mt-1 font-display text-2xl text-white">Investment Analysis</h2>
        </div>
        {analysis.investment_verdict && (
          <div className="rounded-lg border border-forge-accent/40 bg-forge-accent/10 px-4 py-2 text-sm font-semibold text-sky-300">
            Verdict: {analysis.investment_verdict}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-forge-border bg-gradient-to-br from-forge-panel to-[#0e1628] p-6">
        <p className="text-xs uppercase tracking-wider text-forge-muted">Fundability</p>
        <p className="mt-1 font-display text-5xl tabular-nums text-white">
          {analysis.fundability_score.toFixed(1)}
          <span className="text-xl text-forge-muted"> / 100</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCORE_LABELS.map(({ key, label }) => (
          <ScoreCard key={key} label={label} score={Number(analysis[key])} />
        ))}
      </div>

      <section className="rounded-lg border border-forge-border bg-forge-panel/60 p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-forge-muted">
          Transcript
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
          {data.transcript}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <BulletList title="Strengths" items={analysis.strengths} tone="good" />
        <BulletList title="Weaknesses" items={analysis.weaknesses} tone="bad" />
        <BulletList title="Risks" items={analysis.risks} tone="warn" />
        <BulletList title="Recommendations" items={analysis.recommendations} tone="neutral" />
      </div>

      <section className="rounded-lg border border-forge-border bg-forge-panel/60 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forge-muted">
          Investment Memo
        </h3>
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
          {data.investment_memo}
        </div>
      </section>

      <section className="rounded-lg border border-forge-border bg-forge-panel/60 p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forge-muted">
          Executive Summary
        </h3>
        <p className="text-sm leading-relaxed text-slate-200">{data.executive_summary}</p>
        <div className="mt-4">
          {audioSrc ? (
            <audio controls src={audioSrc} className="w-full max-w-lg" />
          ) : (
            <p className="text-sm text-forge-muted">
              Audio unavailable
              {data.message ? ` — ${data.message}` : " (ElevenLabs skipped)."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
