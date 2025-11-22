"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { MobileTimer } from "@/components/game/mobile-timer";
import { Button } from "@/components/ui/button";

interface QuestionDisplayPlayerProps {
  gameId: string;
  playerId: string;
}

/**
 * Player mobile view for question display
 * Mobile-optimized layout (375px-430px width)
 * Displays question, answer options, countdown timer, and lock answer button
 */
export function QuestionDisplayPlayer({
  gameId,
  playerId,
}: QuestionDisplayPlayerProps) {
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    timerDuration,
    startedAt,
  } = useGameStore();

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [lockedAnswerIndex, setLockedAnswerIndex] = useState<number | null>(null);

  // Handle timer expiration - auto-submit selected answer if any
  const handleTimerExpire = () => {
    if (selectedAnswerIndex !== null && lockedAnswerIndex === null) {
      // Auto-lock the selected answer when timer expires
      setLockedAnswerIndex(selectedAnswerIndex);
      // TODO: Auto-submit in Story 2.6
    }
  };

  // Reset selection when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswerIndex(null);
      setLockedAnswerIndex(null);
    }
  }, [currentQuestion?.id]);

  if (!currentQuestion || !startedAt) {
    return null;
  }

  // Answer button colors
  const answerColors = [
    { bg: "bg-purple-500", hover: "hover:bg-purple-600", selected: "bg-purple-700", border: "border-purple-600" }, // A
    { bg: "bg-orange-500", hover: "hover:bg-orange-600", selected: "bg-orange-700", border: "border-orange-600" }, // B
    { bg: "bg-teal-500", hover: "hover:bg-teal-600", selected: "bg-teal-700", border: "border-teal-600" }, // C
    { bg: "bg-red-500", hover: "hover:bg-red-600", selected: "bg-red-700", border: "border-red-600" }, // D (coral)
  ];

  const answerLabels = ["A", "B", "C", "D"];

  const handleAnswerSelect = (index: number) => {
    if (lockedAnswerIndex !== null) return; // Can't change after locking
    setSelectedAnswerIndex(index);
  };

  const handleLockAnswer = () => {
    if (selectedAnswerIndex === null) return;
    setLockedAnswerIndex(selectedAnswerIndex);
    // TODO: Submit answer in Story 2.6
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col p-4"
    >
      {/* Question number at top */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 font-medium">
          Question {questionNumber} of {totalQuestions}
        </p>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-center space-y-6 max-w-md w-full mx-auto">
        {/* Question text */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h1
            className="text-lg font-semibold text-gray-900 leading-relaxed"
            style={{
              maxHeight: "5.5em", // ~4 lines at 18px
              overflow: "auto",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
            }}
          >
            {currentQuestion.questionText}
          </h1>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="flex justify-center"
        >
          <MobileTimer
            duration={timerDuration}
            startedAt={startedAt}
            onExpire={handleTimerExpire}
          />
        </motion.div>

        {/* Answer buttons - stacked vertically */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="space-y-3 w-full"
        >
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswerIndex === index;
            const isLocked = lockedAnswerIndex === index;
            const color = answerColors[index];
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={lockedAnswerIndex !== null}
                className={`
                  w-full
                  ${isSelected || isLocked ? color.selected : color.bg}
                  ${!isLocked && !isSelected ? color.hover : ''}
                  ${isSelected ? `border-4 ${color.border}` : 'border-2 border-transparent'}
                  rounded-xl
                  p-4
                  min-h-[60px]
                  flex items-center gap-4
                  transition-all duration-200
                  shadow-md
                  ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                  ${isSelected && !isLocked ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}
                `}
              >
                {/* Letter label */}
                <div
                  className={`
                    ${isSelected || isLocked ? 'bg-white/30' : 'bg-white/20'}
                    text-white
                    text-2xl
                    font-bold
                    flex-shrink-0
                    w-10
                    h-10
                    flex items-center justify-center
                    rounded-full
                    border-2
                    ${isSelected || isLocked ? 'border-white' : 'border-white/50'}
                  `}
                >
                  {answerLabels[index]}
                </div>

                {/* Option text */}
                <div
                  className={`
                    text-white
                    text-base
                    font-semibold
                    flex-1
                    text-left
                  `}
                  style={{
                    maxHeight: "3em",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {option}
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* Lock Answer button - only shown after selection */}
        {selectedAnswerIndex !== null && lockedAnswerIndex === null && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="w-full"
          >
            <Button
              onClick={handleLockAnswer}
              className="w-full h-[60px] text-lg font-semibold bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              Lock Answer
            </Button>
          </motion.div>
        )}

        {/* Locked indicator */}
        {lockedAnswerIndex !== null && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <p className="text-sm text-gray-600 font-medium">
              Answer locked! Waiting for results...
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

