"use client";

import React from "react";
import { motion } from "framer-motion";

export interface AnalysisProgressBarProps {
  running: boolean;
  progress: number; // 0-100
  elapsedSeconds: number;
  totalSeconds: number;
  messages?: string[];
  className?: string;
}

export function AnalysisProgressBar({
  running,
  progress,
  elapsedSeconds,
  totalSeconds,
  messages = [],
  className = ""
}: AnalysisProgressBarProps) {
  if (!running) return null;

  const currentIndex = Math.min(elapsedSeconds, Math.max(0, messages.length - 1));
  const message = messages[currentIndex] || `Analyzing... ${elapsedSeconds}/${totalSeconds}s`;
  const progressPercent = Math.round(progress);

  return (
    <div className={`sticky bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur border-t border-gray-200 p-3 ${className}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700">{message}</span>
        <span className="text-sm font-medium text-gray-800">{progressPercent}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden relative" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        {/* Base progress fill */}
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
        
        {/* Animated blue line that moves across the progress bar */}
        <motion.div 
          className="absolute top-0 h-full w-[5px] bg-blue-300 opacity-70"
          initial={{ left: 0 }}
          animate={{ 
            left: [`0%`, `${Math.max(0, progress - 5)}%`],
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{
            boxShadow: "0 0 8px 2px rgba(59, 130, 246, 0.5)",
            filter: "blur(1px)"
          }}
        />
      </div>
    </div>
  );
}
