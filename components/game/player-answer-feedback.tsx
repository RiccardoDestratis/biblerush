"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

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
 * Shows if answer was correct/incorrect, points earned, speed bonus, and total score
 * Displays for 5 seconds (matches Story 3.2 reveal duration)
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
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const isCorrect = selectedAnswer === correctAnswer;
  const hasAnswer = selectedAnswer !== null;

  // Calculate speed bonus (from Story 3.1 scoring)
  const getSpeedBonus = (responseTimeMs: number): number => {
    if (responseTimeMs <= 3000) return 5;
    if (responseTimeMs <= 5000) return 3;
    return 0;
  };

  const speedBonus = isCorrect ? getSpeedBonus(responseTimeMs) : 0;
  const basePoints = isCorrect ? 10 : 0;

  // Animate points count-up from 0 to actual points over 500ms
  useEffect(() => {
    if (pointsEarned === 0) {
      setDisplayedPoints(0);
      return;
    }

    const duration = 500; // 500ms animation
    const steps = 30;
    const increment = pointsEarned / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= pointsEarned) {
        setDisplayedPoints(pointsEarned);
        clearInterval(timer);
      } else {
        setDisplayedPoints(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [pointsEarned]);

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

        {/* Points earned (animated count-up) */}
        {isCorrect && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center"
          >
            <div className="text-3xl font-bold text-gray-900">
              +{displayedPoints} points
            </div>
            {speedBonus > 0 && (
              <div className="text-xl text-teal-600 font-semibold mt-2">
                +{speedBonus} speed bonus!
              </div>
            )}
          </motion.div>
        )}

        {/* Incorrect or no answer - show correct answer */}
        {(!isCorrect || !hasAnswer) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center space-y-2"
          >
            <div className="text-lg text-gray-600">
              Correct answer: {correctAnswer} - {correctAnswerText}
            </div>
            <div className="text-lg text-gray-500">+0 points</div>
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

