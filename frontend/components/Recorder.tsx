"use client";

type Props = {
  isRecording: boolean;
  disabled?: boolean;
  onStart: () => void;
  onStop: () => void;
};

export default function Recorder({ isRecording, disabled, onStart, onStop }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {!isRecording ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onStart}
          className="inline-flex items-center gap-2 rounded-lg bg-forge-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-white" />
          Record Pitch
        </button>
      ) : (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center gap-2 rounded-lg bg-forge-bad px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-sm bg-white" />
          Stop & Analyze
        </button>
      )}
      {isRecording && (
        <span className="text-sm text-forge-muted">Listening… speak your startup pitch</span>
      )}
    </div>
  );
}
