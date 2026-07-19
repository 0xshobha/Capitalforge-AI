type Props = {
  title: string;
  items: string[];
  tone?: "neutral" | "good" | "bad" | "warn";
};

const toneMap = {
  neutral: "border-forge-border",
  good: "border-forge-good/40",
  bad: "border-forge-bad/40",
  warn: "border-forge-warn/40",
};

export default function BulletList({ title, items, tone = "neutral" }: Props) {
  return (
    <section className={`rounded-lg border bg-forge-panel/60 p-4 ${toneMap[tone]}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-forge-muted">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-forge-muted/70">None returned.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forge-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
