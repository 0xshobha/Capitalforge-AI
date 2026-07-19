"use client";

import { useEffect, useRef, useState } from "react";
import Recorder from "@/components/Recorder";
import Results from "@/components/Results";
import { analyzeAudio, getApiUrl, type AnalyzeResponse } from "@/lib/api";

export default function HomePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setError(null);
    setResult(null);
    setStatus(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone API not available in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        const blobType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });
        chunksRef.current = [];

        if (blob.size < 1000) {
          setError("Recording too short. Hold Record and speak for a few seconds.");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setStatus("Transcribing & analyzing your pitch…");

        try {
          const ext = blobType.includes("mp4") ? "mp4" : "webm";
          const data = await analyzeAudio(blob, `pitch.${ext}`);
          setResult(data);
          setStatus(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Analysis failed.");
          setStatus(null);
        } finally {
          setIsLoading(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);
    } catch {
      setError("Microphone permission denied or unavailable.");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      setIsRecording(false);
      setIsLoading(true);
      setStatus("Processing recording…");
      recorder.stop();
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-10 border-b border-forge-border/80 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-forge-accent">
          Due Diligence
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-white sm:text-5xl">
          CapitalForge AI
        </h1>
        <p className="mt-3 max-w-2xl text-base text-forge-muted">
          Speak your startup pitch. Get a live transcript, scored analysis, investment memo, and
          spoken executive summary — powered by Whisper, GPT, and ElevenLabs.
        </p>
      </header>

      <section className="rounded-xl border border-forge-border bg-forge-panel/50 p-6">
        <Recorder
          isRecording={isRecording}
          disabled={isLoading}
          onStart={startRecording}
          onStop={stopRecording}
        />

        {(isLoading || status) && (
          <div className="mt-5 flex items-center gap-3 text-sm text-slate-300">
            <span className="spinner" aria-hidden />
            <span>{status || "Working…"}</span>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-forge-bad/40 bg-forge-bad/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <p className="mt-4 text-xs text-forge-muted/80">API: {getApiUrl()}</p>
      </section>

      {result && <Results data={result} />}

      <footer className="mt-16 border-t border-forge-border/60 pt-6 text-xs text-forge-muted/70">
        CapitalForge AI MVP — live audio only. No mock data.
      </footer>
    </main>
  );
}
