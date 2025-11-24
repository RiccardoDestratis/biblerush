"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface AnswerRevealPlayerProps {
  gameId: string;
  questionId: string;
  questionText: string;
  options: string[]; // Array of 4 options [A, B, C, D]
  correctAnswer: string; // 'A', 'B', 'C', or 'D'
  answerContent: string; // Full text content of the correct answer
  showSource: boolean; // Whether to show verse source (reference + content)
  verseReference: string | null; // Scripture reference (e.g., "Matthew 2:1")
  verseContent: string | null; // Full verse text content
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  onComplete: () => void; // Called after 5 seconds
}

/**
 * Answer reveal display component for player mobile view
 * Shows original question text, correct answer with green highlight and checkmark,
 * scripture reference if available, all answer boxes with correct highlighted.
 * Mobile-optimized layout matching the projector reveal but smaller scale.
 */
export function AnswerRevealPlayer({
  questionText,
  options,
  correctAnswer,
  answerContent,
  showSource,
  verseReference,
  verseContent,
  selectedAnswer,
  onComplete,
}: AnswerRevealPlayerProps) {
  const [countdown, setCountdown] = useState(5);
  const [showReveal, setShowReveal] = useState(false); // Start with loading animation, same as host

  // 2-second delay before revealing (same as host)
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowReveal(true);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Countdown timer - shows countdown but doesn't block transition
  // The parent component (player-game-view) will transition to leaderboard when leaderboard_ready event is received
  // This countdown is just for display purposes
  useEffect(() => {
    if (!showReveal) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showReveal]);

  // REMOVED: onComplete callback trigger
  // The leaderboard transition now happens immediately when leaderboard_ready event is received
  // This ensures synchronization with the host/projector view
  // The countdown is just for visual feedback, it doesn't control the transition

  // Get the index of the correct answer
  const correctIndex = ["A", "B", "C", "D"].indexOf(correctAnswer);
  const answerLabels = ["A", "B", "C", "D"];

  // Answer box colors (same as question display)
  const answerColors = [
    { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-900" }, // A
    { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-900" }, // B
    { border: "border-teal-500", bg: "bg-teal-50", text: "text-teal-900" }, // C
    { border: "border-green-500", bg: "bg-green-50", text: "text-green-900" }, // D
  ];

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4"
      >
        {/* Loading phase - 1 second delay */}
        {!showReveal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl"
            >
              ⏳
            </motion.div>
            <div className="text-2xl font-bold text-gray-700">
              Revealing answer...
            </div>
          </motion.div>
        )}

        {/* Reveal phase */}
        {showReveal && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md w-full space-y-6"
          >
        {/* Countdown indicator - informational only, transition happens via leaderboard_ready event */}
        <div className="text-center text-lg font-bold text-gray-700 mb-2">
          {countdown > 0 ? `Revealing answer... ${countdown}` : "Leaderboard loading..."}
        </div>

        {/* Question text with answer boxes - show what was selected */}
        <div className="text-center text-sm text-gray-500">
          {selectedAnswer 
            ? `You selected: ${selectedAnswer}`
            : "You didn't select an answer"}
        </div>

            {/* Original question text */}
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-2xl font-bold text-gray-700 text-center leading-tight"
              style={{
                maxHeight: "4em",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
              }}
            >
              {questionText}
            </motion.h2>

            {/* Correct answer highlighted with checkmark */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
              className="bg-green-500 rounded-xl p-4 shadow-lg border-4 border-green-600 flex flex-col items-center gap-2"
            >
              {/* Checkmark icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.4, type: "spring" }}
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>

              {/* Answer content - shows just the content, no letter prefix */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="text-2xl font-bold text-white text-center"
              >
                {answerContent}
              </motion.div>

              {/* Verse reference and content - only shown if showSource is true */}
              {showSource && verseReference && (
                <motion.div
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  className="text-base text-white/90 font-medium space-y-1"
                >
                  <div>{verseReference}</div>
                  {verseContent && (
                    <div className="text-sm text-white/80 italic">
                      {verseContent}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Player's result indicator */}
              <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className={`text-sm font-semibold mt-2 px-3 py-1 rounded-full ${
                  isCorrect
                    ? "bg-white/20 text-white"
                    : "bg-red-500/80 text-white"
                }`}
              >
                {isCorrect ? "✓ You got it right!" : "✗ You selected " + (selectedAnswer || "nothing")}
              </motion.div>
            </motion.div>

            {/* Answer boxes grid (vertical stack for mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="space-y-3"
            >
              {options.map((option, index) => {
                const isCorrectOption = index === correctIndex;
                const isSelected = selectedAnswer === answerLabels[index];

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0.3, scale: 0.9 }}
                    animate={{ 
                      opacity: isCorrectOption ? 1 : 0.4,
                      scale: 1,
                    }}
                    transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
                    className={`
                      ${
                        isCorrectOption
                          ? "bg-green-500 border-green-600 border-4"
                          : isSelected
                          ? "bg-red-500/50 border-red-400 border-2"
                          : "bg-gray-500 border-gray-400 border-2"
                      }
                      rounded-xl p-4
                      flex items-center space-x-3
                      transition-all duration-300
                    `}
                  >
                    {/* Letter label */}
                    <div
                      className={`
                        ${
                          isCorrectOption
                            ? "bg-white text-green-600 border-2 border-white"
                            : isSelected
                            ? "bg-white text-red-600 border-2 border-white"
                            : "bg-gray-400 text-gray-700 border-2 border-gray-500"
                        }
                        text-3xl font-bold
                        flex-shrink-0
                        w-12 h-12
                        flex items-center justify-center
                        rounded-full
                      `}
                    >
                      {answerLabels[index]}
                    </div>

                    {/* Option text */}
                    <div
                      className={`
                        ${
                          isCorrectOption
                            ? "text-white text-lg font-semibold"
                            : isSelected
                            ? "text-white text-lg font-semibold"
                            : "text-gray-300 text-lg font-semibold"
                        }
                        flex-1
                      `}
                    >
                      {option}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

