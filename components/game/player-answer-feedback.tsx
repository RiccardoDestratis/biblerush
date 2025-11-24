"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { getSpeedBonus, formatResponseTime } from "@/lib/game/scoring";

interface PlayerAnswerFeedbackProps {
  gameId: string;
  playerId: string;
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  correctAnswer: string; // 'A', 'B', 'C', or 'D'
  correctAnswerText: string; // The actual answer text
  options: string[]; // All 4 options [A, B, C, D]
  scriptureReference: string | null;
  pointsEarned: number;
  totalScore: number;
  responseTimeMs: number;
}

/**
 * Player answer feedback component
 * Shows if answer was correct/incorrect, points earned, speed bonus breakdown, and total score
 * Displays for 5 seconds (matches Story 3.2 reveal duration)
 * 
 * Display format:
 * - Correct with speed bonus: "10 points + 5 speed bonus = 15 total"
 * - Correct without speed bonus: "10 points (no speed bonus)" or "10 points + 0 speed bonus = 10 total"
 * - Incorrect: "0 points" (no speed bonus mentioned)
 */
export function PlayerAnswerFeedback({
  selectedAnswer,
  correctAnswer,
  correctAnswerText,
  options,
  scriptureReference,
  pointsEarned,
  totalScore,
  responseTimeMs,
}: PlayerAnswerFeedbackProps) {
  const isCorrect = selectedAnswer === correctAnswer;
  const hasAnswer = selectedAnswer !== null;

  // Calculate speed bonus using imported function
  // Handle case where responseTimeMs might be undefined initially
  const speedBonus = isCorrect ? getSpeedBonus(responseTimeMs || 0) : 0;
  const basePoints = isCorrect ? 10 : 0;

  // NO ANIMATION - just use pointsEarned directly
  const displayedPoints = pointsEarned;

  // Get encouraging message based on result
  const getFeedbackMessage = () => {
    if (isCorrect) {
      return "Correct! Well done!";
    } else if (hasAnswer) {
      return "Incorrect";
    } else {
      return "Time's up! No answer submitted.";
    }
  };

  // Get feedback color
  const getFeedbackColor = () => {
    if (isCorrect) return "text-green-600";
    if (hasAnswer) return "text-red-600";
    return "text-orange-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4"
    >
      <div className="max-w-md w-full space-y-6">
        {/* Feedback icon and message */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          {isCorrect ? (
            <CheckCircle2 className="w-16 h-16 text-green-600" />
          ) : hasAnswer ? (
            <XCircle className="w-16 h-16 text-red-600" />
          ) : (
            <XCircle className="w-16 h-16 text-orange-600" />
          )}

          <h2
            className={`text-2xl font-bold text-center ${getFeedbackColor()}`}
          >
            {getFeedbackMessage()}
          </h2>
        </motion.div>

        {/* Points earned (animated count-up) with breakdown */}
        {isCorrect && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center space-y-2"
            role="status"
            aria-live="polite"
            aria-label={`Correct answer. ${basePoints} points${speedBonus > 0 ? ` plus ${speedBonus} speed bonus equals ${pointsEarned} total points` : speedBonus === 0 ? ` (no speed bonus)` : ""}`}
          >
            {/* Base points */}
            <div className="text-3xl font-bold text-gray-900">
              {basePoints} points
            </div>
            
            {/* Speed bonus breakdown */}
            {speedBonus > 0 ? (
              <div className="text-xl text-teal-600 font-semibold">
                +{speedBonus} speed bonus
              </div>
            ) : (
              <div className="text-lg text-gray-600">
                (no speed bonus)
              </div>
            )}
            
            {/* Total breakdown */}
            <div className="text-2xl font-bold text-gray-900 pt-2">
              = {displayedPoints} total
            </div>
            
            {/* Response time display */}
            <div className="text-sm text-gray-600 pt-1">
              Answered in {formatResponseTime(responseTimeMs)}
            </div>
          </motion.div>
        )}

        {/* Incorrect or no answer - show correct answer */}
        {(!isCorrect || !hasAnswer) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center space-y-2"
            role="status"
            aria-live="polite"
            aria-label={hasAnswer ? "Incorrect answer. 0 points" : "Time's up. No answer submitted. 0 points"}
          >
            <div className="text-lg text-gray-600">
              Correct answer: {correctAnswer} - {correctAnswerText}
            </div>
            <div className="text-lg font-semibold text-gray-900">0 points</div>
            {hasAnswer && (
              <div className="text-sm text-gray-600">
                Answered in {formatResponseTime(responseTimeMs)}
              </div>
            )}
          </motion.div>
        )}

        {/* Scripture reference */}
        {scriptureReference && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-center"
          >
            <div className="text-sm text-gray-600">{scriptureReference}</div>
          </motion.div>
        )}

        {/* Total score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-center pt-4 border-t border-gray-300"
        >
          <div className="text-lg font-bold text-gray-900">
            Total Score: {totalScore} points
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

