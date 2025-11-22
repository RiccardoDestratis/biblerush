"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CircularTimerProps {
  duration: number; // Total duration in seconds
  startedAt: string; // ISO timestamp when timer started
  onExpire?: () => void; // Callback when timer reaches 0
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
}: CircularTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (hasExpired) return;

    // Calculate remaining time based on server timestamp
    const calculateRemaining = () => {
      const startTime = new Date(startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remainingSeconds = Math.max(0, duration - elapsed);
      
      return remainingSeconds;
    };

    // Initial calculation
    setRemaining(calculateRemaining());

    // Update every second
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
  }, [duration, startedAt, onExpire, hasExpired]);

  // Calculate progress percentage (0-100)
  const progress = (remaining / duration) * 100;
  
  // Determine color based on remaining time
  let color: string;
  if (remaining > 10) {
    color = "#22C55E"; // Green
  } else if (remaining > 5) {
    color = "#EAB308"; // Yellow
  } else {
    color = "#EF4444"; // Red
  }

  // Calculate circumference for SVG circle (radius = 60, so circumference = 2 * π * 60 ≈ 377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" role="timer" aria-label={`${remaining} seconds remaining`}>
      <svg
        className="transform -rotate-90"
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
          transition={{ duration: 0.3, ease: "linear" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {/* Timer number display */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={remaining}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-7xl font-bold"
          style={{ color }}
        >
          {remaining}
        </motion.span>
      </div>
    </div>
  );
}

