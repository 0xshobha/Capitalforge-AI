type Props = {
  label: string;
  score: number;
  max?: number;
};

export default function ScoreCard({ label, score, max = 10 }: Props) {
  const pct = Math.max(0, Math.min(100, (score / max) * 100));
  let bar = "bg-forge-accent";
  if (pct >= 70) bar = "bg-forge-good";
  else if (pct < 40) bar = "bg-forge-bad";
  else if (pct < 60) bar = "bg-forge-warn";

  return (
    <div className="rounded-lg border border-forge-border bg-forge-panel/80 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm text-forge-muted">{label}</span>
        <span className="font-semibold tabular-nums text-white">
          {score.toFixed(1)}
          <span className="text-xs font-normal text-forge-muted">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/40">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
