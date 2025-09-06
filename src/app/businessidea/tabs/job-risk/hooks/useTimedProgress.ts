"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface TimedProgressState {
  running: boolean;
  progress: number; // 0-100
  elapsedSeconds: number; // whole seconds
}

export interface TimedProgressControls {
  start: (durationMs: number, onComplete?: () => void) => void;
  stop: () => void;
  reset: () => void;
}

export function useTimedProgress(): TimedProgressState & TimedProgressControls {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const durationRef = useRef<number>(10000);
  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const secondIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | undefined>(undefined);
  const runningRef = useRef<boolean>(false);

  const tick = useCallback(() => {
    if (!runningRef.current || startTimeRef.current == null) return;
    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    const pct = Math.min(100, (elapsed / durationRef.current) * 100);
    setProgress(pct);
    if (elapsed >= durationRef.current) {
      // Finish
      runningRef.current = false;
      setRunning(false);
      setProgress(100);
      if (secondIntervalRef.current) {
        clearInterval(secondIntervalRef.current);
        secondIntervalRef.current = null;
      }
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }
    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback((durationMs: number, onComplete?: () => void) => {
    // Reset first
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);
    setProgress(0);
    setElapsedSeconds(0);

    durationRef.current = durationMs;
    onCompleteRef.current = onComplete;
    startTimeRef.current = performance.now();
    runningRef.current = true;
    setRunning(true);

    // Schedule tick on next frame to ensure initial mount/paint before width transition
    rafIdRef.current = requestAnimationFrame(tick);

    secondIntervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  }, [tick]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);
    rafIdRef.current = null;
    secondIntervalRef.current = null;
  }, []);

  const reset = useCallback(() => {
    stop();
    setProgress(0);
    setElapsedSeconds(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (secondIntervalRef.current) clearInterval(secondIntervalRef.current);
    };
  }, []);

  return { running, progress, elapsedSeconds, start, stop, reset };
}
