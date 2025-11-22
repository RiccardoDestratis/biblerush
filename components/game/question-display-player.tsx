"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { MobileTimer } from "@/components/game/mobile-timer";
import { submitAnswer } from "@/lib/actions/answers";
import { createGameChannel, subscribeToGameChannel } from "@/lib/supabase/realtime";
import type { QuestionAdvancePayload, GameEndPayload } from "@/lib/types/realtime";
import { toast } from "sonner";

interface QuestionDisplayPlayerProps {
  gameId: string;
  playerId: string;
}

type SubmissionStatus = "idle" | "submitting" | "submitted" | "error";

/**
 * Player mobile view for question display with tap-to-lock pattern
 * Mobile-optimized layout (375px-430px width)
 * Tap answer once to select (orange), tap again to lock (green/shiny)
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
    advanceQuestion: advanceQuestionStore,
    setGameStatus,
  } = useGameStore();
  
  const channelRef = useRef<ReturnType<typeof createGameChannel> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // State for answer selection (string format: 'A', 'B', 'C', 'D')
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [lockedAnswer, setLockedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [showLowTimeWarning, setShowLowTimeWarning] = useState(false);
  const [lowTimeRemaining, setLowTimeRemaining] = useState<number | null>(null);
  const [showTimerEnlargement, setShowTimerEnlargement] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState<string>("");
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // Calculate response time in milliseconds
  const calculateResponseTime = useCallback((): number => {
    if (!startedAt) return 0;
    const startTime = new Date(startedAt).getTime();
    const now = Date.now();
    return Math.max(0, now - startTime);
  }, [startedAt]);

  // Submit answer to server
  const handleSubmitAnswer = useCallback(
    async (answer: "A" | "B" | "C" | "D" | null, responseTimeMs: number) => {
      if (!currentQuestion) return;

      // Prevent duplicate submissions
      if (submissionStatus === "submitted" || submissionStatus === "submitting") {
        return;
      }

      setSubmissionStatus("submitting");

      try {
        const result = await submitAnswer(
          gameId,
          playerId,
          currentQuestion.id,
          answer,
          responseTimeMs
        );

        if (result.success) {
          setSubmissionStatus("submitted");
          setShowMessage(true);
          setMessageText(answer ? "You selected. Waiting for other players." : "You did not select anything.");
        } else {
          // Retry once automatically after 500ms
          setTimeout(async () => {
            const retryResult = await submitAnswer(
              gameId,
              playerId,
              currentQuestion.id,
              answer,
              responseTimeMs
            );

            if (retryResult.success) {
              setSubmissionStatus("submitted");
              setShowMessage(true);
              setMessageText(answer ? "You selected. Waiting for other players." : "You did not select anything.");
            } else {
              setSubmissionStatus("error");
              setLockedAnswer(null);
              setShowMessage(false);
              
              if (retryResult.error === "Answer already submitted") {
                toast.error("Answer already submitted");
              } else if (retryResult.error.includes("Game") || retryResult.error.includes("Question")) {
                toast.error("Game data error. Please refresh.");
              } else {
                toast.error("Submission failed. Your answer may not be recorded.");
              }
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
        setSubmissionStatus("error");
        setLockedAnswer(null);
        setShowMessage(false);
        toast.error("Submission failed. Your answer may not be recorded.");
      }
    },
    [gameId, playerId, currentQuestion, submissionStatus]
  );

  // Handle tap-to-lock pattern
  const handleAnswerTap = useCallback(
    (answer: "A" | "B" | "C" | "D") => {
      // If already submitted, do nothing
      if (submissionStatus === "submitted") return;

      // If this answer is already selected (orange state)
      if (selectedAnswer === answer && lockedAnswer === null) {
        // Double-tap: Lock the answer (green/shiny state)
        setLockedAnswer(answer);
        setShowLowTimeWarning(false);
        
        // Optimistic UI: Show green state immediately
        const responseTimeMs = calculateResponseTime();
        
        // Haptic feedback (optional, may not work on all devices)
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(100);
        }

        // Submit in background
        handleSubmitAnswer(answer, responseTimeMs);
      } else if (selectedAnswer !== answer) {
        // Single-tap: Select this answer (orange state)
        setSelectedAnswer(answer);
        setShowLowTimeWarning(false); // Hide warning when answer is selected
      }
    },
    [selectedAnswer, lockedAnswer, submissionStatus, calculateResponseTime, handleSubmitAnswer]
  );

  // Handle timer expiration - auto-submit
  const handleTimerExpire = useCallback(() => {
    if (hasAutoSubmitted) return;
    setHasAutoSubmitted(true);
    setShowLowTimeWarning(false);

    // If already locked/submitted, do nothing
    if (submissionStatus === "submitted") return;

    // Auto-submit current selection (or null if no selection)
    const responseTimeMs = timerDuration * 1000; // Full duration
    handleSubmitAnswer(selectedAnswer, responseTimeMs);
    
    // Show appropriate message
    if (selectedAnswer) {
      setLockedAnswer(selectedAnswer);
      setShowMessage(true);
      setMessageText("You selected. Waiting for other players.");
    } else {
      setShowMessage(true);
      setMessageText("You did not select anything.");
    }
  }, [hasAutoSubmitted, submissionStatus, timerDuration, selectedAnswer, handleSubmitAnswer]);

  // Handle low-time warning (timer ≤ 5 seconds)
  const handleLowTime = useCallback(
    (remaining: number) => {
      // Only show warning if no answer is selected
      if (selectedAnswer === null && submissionStatus !== "submitted") {
        setShowLowTimeWarning(true);
        setLowTimeRemaining(remaining);
        
        // Trigger timer enlargement animation (only once when first entering low-time)
        if (!showTimerEnlargement) {
          setShowTimerEnlargement(true);
          // Return to normal size after 1.5 seconds
          setTimeout(() => {
            setShowTimerEnlargement(false);
          }, 1500);
        }
      } else {
        // Hide warning if answer is selected or submitted
        setShowLowTimeWarning(false);
        setShowTimerEnlargement(false);
      }
    },
    [selectedAnswer, submissionStatus, showTimerEnlargement]
  );

  // Dismiss "Starting game..." toast when question display appears
  useEffect(() => {
    if (currentQuestion && startedAt) {
      toast.dismiss("game-start");
    }
  }, [currentQuestion, startedAt]);

  // Create Realtime channel for listening to question_advance
  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = createGameChannel(gameId);
      
      // Subscribe to channel with event handlers
      unsubscribeRef.current = subscribeToGameChannel(channelRef.current, gameId, {
        onQuestionAdvance: (payload: QuestionAdvancePayload) => {
          // Update game store with new question data
          advanceQuestionStore(payload);
          // Reset answer selection state when question advances
          setSelectedAnswer(null);
          setLockedAnswer(null);
          setSubmissionStatus("idle");
          setShowLowTimeWarning(false);
          setLowTimeRemaining(null);
          setShowTimerEnlargement(false);
          setShowMessage(false);
          setMessageText("");
          setHasAutoSubmitted(false);
          toast.dismiss(); // Dismiss any previous toasts
        },
        onGameEnd: (payload: GameEndPayload) => {
          // Game ended - update status
          setGameStatus("ended");
          toast.success("Game completed!");
          // TODO: Navigate to results screen (Story 3.7)
        },
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [gameId, advanceQuestionStore, setGameStatus]);

  // Reset state when question changes
  useEffect(() => {
    if (currentQuestion) {
      setSelectedAnswer(null);
      setLockedAnswer(null);
      setSubmissionStatus("idle");
      setShowLowTimeWarning(false);
      setLowTimeRemaining(null);
      setShowTimerEnlargement(false);
      setShowMessage(false);
      setMessageText("");
      setHasAutoSubmitted(false);
    }
  }, [currentQuestion?.id]);

  if (!currentQuestion || !startedAt) {
    return null;
  }

  // Answer button colors
  const answerColors = [
    { bg: "bg-purple-500", hover: "hover:bg-purple-600", selected: "bg-orange-500", locked: "bg-green-500", border: "border-purple-600" }, // A
    { bg: "bg-orange-500", hover: "hover:bg-orange-600", selected: "bg-orange-500", locked: "bg-green-500", border: "border-orange-600" }, // B
    { bg: "bg-teal-500", hover: "hover:bg-teal-600", selected: "bg-orange-500", locked: "bg-green-500", border: "border-teal-600" }, // C
    { bg: "bg-red-500", hover: "hover:bg-red-600", selected: "bg-orange-500", locked: "bg-green-500", border: "border-red-600" }, // D (coral)
  ];

  const answerLabels: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
  const isSubmitted = submissionStatus === "submitted";

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

        {/* Timer with low-time warning */}
        <div className="flex flex-col items-center gap-2">
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
              onLowTime={handleLowTime}
              showWarning={showTimerEnlargement}
            />
          </motion.div>

          {/* Low-time warning message */}
          <AnimatePresence>
            {showLowTimeWarning && lowTimeRemaining !== null && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p className="text-xl font-bold text-amber-600">
                  Select something now. You only have {lowTimeRemaining} more seconds!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Answer buttons - stacked vertically */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="space-y-3 w-full"
        >
          {currentQuestion.options.map((option, index) => {
            const answerLabel = answerLabels[index];
            const isSelected = selectedAnswer === answerLabel && lockedAnswer === null;
            const isLocked = lockedAnswer === answerLabel;
            const color = answerColors[index];
            
            // Determine button state styling
            let buttonClass = color.bg;
            if (isLocked) {
              buttonClass = `${color.locked} shadow-lg ring-4 ring-green-300 ring-opacity-50`;
            } else if (isSelected) {
              buttonClass = `${color.selected} border-4 ${color.border}`;
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerTap(answerLabel)}
                disabled={isSubmitted}
                className={`
                  w-full
                  ${buttonClass}
                  ${!isSubmitted && !isLocked && !isSelected ? color.hover : ''}
                  rounded-xl
                  p-4
                  min-h-[60px]
                  flex items-center gap-4
                  transition-all duration-300
                  shadow-md
                  ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${isSelected && !isLocked ? 'ring-2 ring-offset-2 ring-yellow-400' : ''}
                  ${isLocked ? 'animate-pulse' : ''}
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
                  {answerLabel}
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

        {/* On-screen message (not a toast) */}
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <p className="text-lg text-gray-700">
                {messageText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
