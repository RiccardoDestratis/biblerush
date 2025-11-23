"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MobileTimerProps {
  duration: number; // Total duration in seconds
  startedAt: string; // ISO timestamp when timer started
  onExpire?: () => void; // Callback when timer reaches 0
  onLowTime?: (remaining: number) => void; // Callback when timer ≤ 5 seconds
  showWarning?: boolean; // Whether to show low-time warning animation
  isPaused?: boolean; // Whether the timer is paused
  pausedAt?: string | null; // ISO timestamp when pause occurred
  pauseDuration?: number; // Total accumulated pause duration in seconds
}

/**
 * Mobile-optimized countdown timer component
 * Compact version for player mobile view (40px height)
 * Synchronized with server time to prevent client drift
 * Color transitions: Green (15-10s) → Yellow (9-5s) → Red (4-0s)
 */
export function MobileTimer({
  duration,
  startedAt,
  onExpire,
  onLowTime,
  showWarning = false,
  isPaused = false,
  pausedAt = null,
  pauseDuration = 0,
}: MobileTimerProps) {
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

        // Trigger low-time warning callback every second when ≤ 5 seconds
        if (remainingSeconds <= 5 && remainingSeconds > 0) {
          onLowTime?.(remainingSeconds);
        }

        if (remainingSeconds === 0 && !hasExpired) {
          setHasExpired(true);
          onExpire?.();
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [duration, startedAt, onExpire, hasExpired, onLowTime, isPaused, pausedAt, pauseDuration, frozenRemaining]);

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

  // Compact circular timer for mobile (smaller radius)
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2" role="timer" aria-label={`${displayRemaining} seconds remaining${isPaused ? " (paused)" : ""}`}>
      {/* Compact circular progress with enlargement animation */}
      <motion.div
        className={`relative ${isPaused ? "opacity-60" : ""}`}
        style={{ width: "40px", height: "40px" }}
        animate={{
          scale: showWarning ? 1.4 : 1,
        }}
        transition={{
          duration: showWarning ? 1.5 : 0.5,
          ease: "easeOut",
        }}
      >
        <svg
          className="transform -rotate-90"
          width="40"
          height="40"
          viewBox="0 0 40 40"
        >
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r={radius}
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx="20"
            cy="20"
            r={radius}
            stroke={color}
            strokeWidth="3"
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
      </motion.div>
      
      {/* Numeric countdown text */}
      <motion.span
        key={displayRemaining}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`text-lg font-semibold ${isPaused ? "opacity-60" : ""}`}
        style={{ color }}
      >
        {displayRemaining}s remaining{isPaused ? " (paused)" : ""}
      </motion.span>
    </div>
  );
}

