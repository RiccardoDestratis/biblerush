"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Pause, Play, SkipForward } from "lucide-react";
import { getGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { GamePausePayload, GameResumePayload } from "@/lib/types/realtime";
import { useGameStore } from "@/lib/store/game-store";
import { toast } from "sonner";

interface AnswerRevealProjectorProps {
  gameId: string;
  questionId: string;
  questionText: string;
  options: string[]; // Array of 4 options [A, B, C, D]
  correctAnswer: string; // 'A', 'B', 'C', or 'D'
  answerContent: string; // Full text content of the correct answer
  showSource: boolean; // Whether to show verse source (reference + content)
  verseReference: string | null; // Scripture reference (e.g., "Matthew 2:1")
  verseContent: string | null; // Full verse text content
  onComplete: () => void; // Called after 5 seconds
}

/**
 * Answer reveal display component for projector view
 * Shows original question text, correct answer with green highlight and checkmark,
 * scripture reference if available, all answer boxes in 2x2 grid with correct
 * highlighted and incorrect grayed out. 5-second duration with countdown.
 */
export function AnswerRevealProjector({
  gameId,
  questionText,
  options,
  correctAnswer,
  answerContent,
  showSource,
  verseReference,
  verseContent,
  onComplete,
}: AnswerRevealProjectorProps) {
  const [countdown, setCountdown] = useState(5);
  const [showReveal, setShowReveal] = useState(false);
  const [isCountdownPaused, setIsCountdownPaused] = useState(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isPaused, pausedAt, setPaused, setResumed } = useGameStore();

  // 2-second delay before revealing
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowReveal(true);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Reveal countdown timer - triggers onComplete after 5 seconds of reveal
  useEffect(() => {
    if (!showReveal) return;
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    const timer = setInterval(() => {
      if (!isCountdownPaused) {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onComplete(); // Transition to leaderboard when reveal countdown reaches zero
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    
    countdownIntervalRef.current = timer;

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showReveal, onComplete, isCountdownPaused]);

  // Handle pause button click
  const handlePause = async () => {
    const channel = getGameChannel(gameId);
    if (!channel) return;
    
    const pausedAt = new Date().toISOString();
    const payload: GamePausePayload = { pausedAt };
    
    // Update local state immediately
    setPaused(pausedAt);
    setIsCountdownPaused(true);
    
    // Broadcast to all devices
    await broadcastGameEvent(gameId, "game_pause", payload);
    toast.info("Game paused");
  };

  // Handle resume button click
  const handleResume = async () => {
    const channel = getGameChannel(gameId);
    if (!channel || !pausedAt) return;
    
    const resumedAt = new Date().toISOString();
    const pauseDuration = Math.floor((new Date(resumedAt).getTime() - new Date(pausedAt).getTime()) / 1000);
    const payload: GameResumePayload = { resumedAt, pauseDuration };
    
    // Update local state immediately
    setResumed(resumedAt);
    setIsCountdownPaused(false);
    
    // Broadcast to all devices
    await broadcastGameEvent(gameId, "game_resume", payload);
    toast.success("Game resumed");
  };

  // Handle skip button click - advance to leaderboard
  const handleSkip = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    onComplete(); // Call parent's handler to advance to leaderboard
  };

  // Get the index of the correct answer
  const correctIndex = ["A", "B", "C", "D"].indexOf(correctAnswer);
  const answerLabels = ["A", "B", "C", "D"];
  const answerOptions = options; // Already an array

  // Answer box colors (same as question display)
  const answerColors = [
    { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-900" }, // A
    { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-900" }, // B
    { border: "border-teal-500", bg: "bg-teal-50", text: "text-teal-900" }, // C
    { border: "border-green-500", bg: "bg-green-50", text: "text-green-900" }, // D
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto"
        style={{ minHeight: "100vh" }}
      >
        {/* Loading phase - 2 second delay with animation */}
        {!showReveal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-4 md:space-y-6"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-4xl md:text-8xl"
            >
              ⏳
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-4xl font-bold text-gray-700 text-center px-4"
            >
              Revealing answer...
            </motion.div>
          </motion.div>
        )}

        {/* Reveal phase - fancy animation with blur effect */}
        {showReveal && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(20px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center max-w-6xl w-full space-y-6 md:space-y-12 px-4 md:px-8 pb-20 md:pb-0"
          >
            {/* Countdown indicator (bottom-right) */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 text-base md:text-xl font-bold text-gray-700 bg-white/80 px-3 py-2 rounded-lg shadow-md">
              Next: Leaderboard in {countdown}...
            </div>

            {/* Floating Gamey Control Buttons - Bottom Right */}
            <div className="absolute bottom-6 md:bottom-8 right-6 md:right-8 flex flex-col gap-3 md:gap-4 z-30">
              {/* Pause/Play Button - Gamey Style */}
              <motion.button
                onClick={isPaused || isCountdownPaused ? handleResume : handlePause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative
                  px-6 md:px-8 py-4 md:py-5
                  text-lg md:text-2xl font-black
                  text-white
                  rounded-2xl md:rounded-3xl
                  shadow-2xl
                  border-4 border-white/30
                  transition-all duration-200
                  ${isPaused || isCountdownPaused
                    ? "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700" 
                    : "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700"
                  }
                  transform
                  active:translate-y-1
                `}
                style={{
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  {isPaused || isCountdownPaused ? (
                    <>
                      <Play className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" />
                      <span className="hidden sm:inline">PLAY</span>
                    </>
                  ) : (
                    <>
                      <Pause className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" />
                      <span className="hidden sm:inline">PAUSE</span>
                    </>
                  )}
                </div>
              </motion.button>
              
              {/* Skip Button - Gamey Style */}
              <motion.button
                onClick={handleSkip}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="
                  relative
                  px-6 md:px-8 py-4 md:py-5
                  text-lg md:text-2xl font-black
                  text-white
                  rounded-2xl md:rounded-3xl
                  shadow-2xl
                  border-4 border-white/30
                  bg-gradient-to-br from-orange-500 via-red-500 to-pink-600
                  hover:from-orange-600 hover:via-red-600 hover:to-pink-700
                  transition-all duration-200
                  transform
                  active:translate-y-1
                "
                style={{
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <SkipForward className="h-6 w-6 md:h-8 md:w-8" fill="currentColor" />
                  <span className="hidden sm:inline">SKIP</span>
                </div>
              </motion.button>
            </div>

            {/* Original question text */}
            <motion.h2
              initial={{ y: -30, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
              className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700 text-center leading-tight px-4 md:px-8"
              style={{
                maxHeight: "4em",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {questionText}
            </motion.h2>

            {/* Correct answer highlighted with checkmark - fancy reveal */}
            <motion.div
              initial={{ 
                scale: 0.8, 
                opacity: 0, 
                rotateY: -90,
                filter: "blur(10px)"
              }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
                filter: "blur(0px)"
              }}
              transition={{ 
                delay: 0.4, 
                duration: 0.8, 
                type: "spring",
                stiffness: 100
              }}
              className="bg-green-500 rounded-xl md:rounded-2xl p-4 md:p-8 shadow-2xl border-2 md:border-4 border-green-600 flex flex-col items-center gap-3 md:gap-4 max-w-2xl w-full"
            >
              {/* Large checkmark icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 className="w-12 h-12 md:w-20 md:h-20 text-white" />
              </motion.div>

              {/* Answer content - shows just the content, no letter prefix */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="text-2xl md:text-5xl font-bold text-white text-center px-2"
              >
                {answerContent}
              </motion.div>

              {/* Verse reference and content - only shown if showSource is true */}
              {showSource && verseReference && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                  className="text-lg md:text-2xl text-white/90 font-medium mt-2 text-center px-2 space-y-2"
                >
                  <div>{verseReference}</div>
                  {verseContent && (
                    <div className="text-base md:text-xl text-white/80 italic">
                      {verseContent}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Answer boxes grid (2x2 layout) - fancy reveal animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 w-full max-w-4xl"
            >
              {answerOptions.map((option, index) => {
                const isCorrect = index === correctIndex;
                return (
                  <motion.div
                    key={index}
                    initial={{ 
                      opacity: 0.3, 
                      scale: 0.9,
                      filter: isCorrect ? "blur(5px)" : "blur(0px)"
                    }}
                    animate={{ 
                      opacity: isCorrect ? 1 : 0.4,
                      scale: 1,
                      filter: "blur(0px)"
                    }}
                    transition={{ 
                      delay: 1.4 + (index * 0.1), 
                      duration: 0.5,
                      type: "spring",
                      stiffness: 150
                    }}
                    className={`
                      ${
                        isCorrect
                          ? "bg-green-500 border-green-600 border-2 md:border-4"
                          : "bg-gray-500 border-gray-400 border-2 md:border-4"
                      }
                      rounded-xl md:rounded-2xl p-4 md:p-6
                      flex items-center space-x-3 md:space-x-4
                      transition-all duration-300
                    `}
                    style={{ minHeight: "80px" }}
                  >
                  {/* Letter label */}
                  <div
                    className={`
                      ${
                        isCorrect
                          ? "bg-white text-green-600 border-2 border-white"
                          : "bg-gray-400 text-gray-700 border-2 border-gray-500"
                      }
                      text-3xl md:text-5xl font-bold
                      flex-shrink-0
                      w-12 h-12 md:w-16 md:h-16
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
                        isCorrect
                          ? "text-white text-lg md:text-3xl font-semibold"
                          : "text-gray-300 text-lg md:text-3xl font-semibold"
                      }
                      flex-1
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

