"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CircularTimerProps {
  duration: number; // Total duration in seconds
  startedAt: string; // ISO timestamp when timer started
  onExpire?: () => void; // Callback when timer reaches 0
  isPaused?: boolean; // Whether the timer is paused
  pausedAt?: string | null; // ISO timestamp when pause occurred
  pauseDuration?: number; // Total accumulated pause duration in seconds
}

/**
 * Circular countdown timer component
 * Synchronized with server time to prevent client drift
 * Color transitions: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
 */
export function CircularTimer({
  duration,
  startedAt,
  onExpire,
  isPaused = false,
  pausedAt = null,
  pauseDuration = 0,
}: CircularTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [hasExpired, setHasExpired] = useState(false);
  const [frozenRemaining, setFrozenRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (hasExpired) return;

    // Calculate remaining time based on server timestamp, accounting for pause duration
    const calculateRemaining = () => {
      const startTime = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      // Subtract pause duration to account for time spent paused
      const adjustedElapsed = elapsed - pauseDuration;
      const remainingSeconds = Math.max(0, duration - adjustedElapsed);
      
      return remainingSeconds;
    };

    // When paused, freeze the current remaining time
    if (isPaused && pausedAt) {
      if (frozenRemaining === null) {
        // First time pausing - calculate and freeze
        const remainingAtPause = calculateRemaining();
        setFrozenRemaining(remainingAtPause);
      }
      // Don't update timer while paused
      return;
    }

    // When resuming, clear frozen state
    if (!isPaused && frozenRemaining !== null) {
      setFrozenRemaining(null);
    }

    // Initial calculation (or when resuming)
    const currentRemaining = frozenRemaining !== null ? frozenRemaining : calculateRemaining();
    setRemaining(currentRemaining);

    // Update every second (only when not paused)
    if (!isPaused) {
      const interval = setInterval(() => {
        const remainingSeconds = calculateRemaining();
        setRemaining(remainingSeconds);

        if (remainingSeconds === 0 && !hasExpired) {
          setHasExpired(true);
          onExpire?.();
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [duration, startedAt, onExpire, hasExpired, isPaused, pausedAt, pauseDuration, frozenRemaining]);

  // Use frozen remaining if paused, otherwise use current remaining
  const displayRemaining = isPaused && frozenRemaining !== null ? frozenRemaining : remaining;
  
  // Calculate progress percentage (0-100)
  const progress = (displayRemaining / duration) * 100;
  
  // Determine color based on remaining time
  let color: string;
  if (displayRemaining > 10) {
    color = "#22C55E"; // Green
  } else if (displayRemaining > 5) {
    color = "#EAB308"; // Yellow
  } else {
    color = "#EF4444"; // Red
  }
  
  // When paused, use a slightly muted color
  if (isPaused) {
    color = "#94A3B8"; // Slate gray
  }

  // Calculate circumference for SVG circle (radius = 60, so circumference = 2 * π * 60 ≈ 377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" role="timer" aria-label={`${displayRemaining} seconds remaining${isPaused ? " (paused)" : ""}`}>
      <svg
        className={`transform -rotate-90 ${isPaused ? "opacity-60" : ""}`}
        width="160"
        height="160"
        viewBox="0 0 160 160"
      >
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={isPaused ? { duration: 0 } : { duration: 0.3, ease: "linear" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Timer number display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={displayRemaining}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className={`text-7xl font-bold ${isPaused ? "opacity-60" : ""}`}
          style={{ color }}
        >
          {displayRemaining}
        </motion.span>
      </div>
      {/* Freezing overlay animation when paused */}
      {isPaused && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute text-4xl"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ⏸
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

