"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface StaggeredRevealState {
  revealedCount: number; // number of items currently revealed
  isRevealing: boolean;
  focusedItem: number | null; // currently focused item
}

export function useStaggeredReveal(stepMs: number = 1000) { // Changed to 1000ms (1 second)
  const [revealedCount, setRevealedCount] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [focusedItem, setFocusedItem] = useState<number | null>(null);
  const targetRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const begin = useCallback((targetItems: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    
    targetRef.current = targetItems;
    setRevealedCount(0);
    setFocusedItem(null);
    setIsRevealing(true);
    
    // Start the reveal sequence
    timerRef.current = setInterval(() => {
      setRevealedCount((n) => {
        const next = n + 1;
        
        // Set focus to the newly revealed item
        setFocusedItem(next);
        
        // Schedule auto-scroll to the element
        const elementId = `reveal-section-${next}`;
        setTimeout(() => {
          const element = document.getElementById(elementId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        if (next >= targetRef.current) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRevealing(false);
          
          // Clear focus after all items are revealed
          focusTimerRef.current = setTimeout(() => {
            setFocusedItem(null);
          }, stepMs * 2);
        }
        
        return next;
      });
    }, stepMs);
  }, [stepMs]);

  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    timerRef.current = null;
    focusTimerRef.current = null;
    setRevealedCount(0);
    setFocusedItem(null);
    setIsRevealing(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  return { revealedCount, isRevealing, focusedItem, begin, reset } as StaggeredRevealState & { begin: (target: number) => void; reset: () => void };
}
