"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { CircularTimer } from "@/components/game/circular-timer";
import { createGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { TimerExpiredPayload } from "@/lib/types/realtime";
import { getPlayerCount } from "@/lib/actions/players";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Pause, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface QuestionDisplayProjectorProps {
  gameId: string;
  initialPlayerCount?: number; // Server-fetched initial count (optimization)
}

/**
 * Projector view for question display
 * Full-screen layout optimized for 1920x1080 with responsive fallback
 * Displays question, answer options, countdown timer, and metadata
 */
export function QuestionDisplayProjector({
  gameId,
  initialPlayerCount = 0,
}: QuestionDisplayProjectorProps) {
  const {
    currentQuestion,
    questionNumber,
    totalQuestions,
    timerDuration,
    startedAt,
  } = useGameStore();

  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const channelRef = useRef<ReturnType<typeof createGameChannel> | null>(null);
  const hasBroadcastExpiredRef = useRef(false);
  const currentQuestionIdRef = useRef<string | null>(null);

  // Update player count periodically (initial count already set from server)
  useEffect(() => {
    const fetchPlayerCount = async () => {
      const result = await getPlayerCount(gameId);
      if (result.success) {
        setPlayerCount(result.count);
      }
    };

    // Only fetch if we don't have initial count, or update every 5 seconds
    if (initialPlayerCount === 0) {
      fetchPlayerCount();
    }
    // Update player count every 5 seconds for real-time updates
    const interval = setInterval(fetchPlayerCount, 5000);
    return () => clearInterval(interval);
  }, [gameId, initialPlayerCount]);

  // Dismiss "Starting game..." toast when question display appears
  useEffect(() => {
    if (currentQuestion && startedAt) {
      // Dismiss the loading toast from HostWaitingRoom
      toast.dismiss("game-start");
    }
  }, [currentQuestion, startedAt]);

  // Reset expired flag when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== currentQuestionIdRef.current) {
      currentQuestionIdRef.current = currentQuestion.id;
      hasBroadcastExpiredRef.current = false;
    }
  }, [currentQuestion]);

  // Create Realtime channel for broadcasting timer_expired
  useEffect(() => {
    if (!channelRef.current) {
      channelRef.current = createGameChannel(gameId);
      // Subscribe to channel (required before broadcasting)
      channelRef.current.subscribe();
    }
    return () => {
      // Channel cleanup handled by parent component
    };
  }, [gameId]);

  // Handle timer expiration
  const handleTimerExpire = async () => {
    if (hasBroadcastExpiredRef.current || !currentQuestion) return;
    
    hasBroadcastExpiredRef.current = true;
    
    const payload: TimerExpiredPayload = {
      questionId: currentQuestion.id,
      questionNumber,
      timestamp: new Date().toISOString(),
    };

    if (channelRef.current) {
      await broadcastGameEvent(channelRef.current, "timer_expired", payload);
    }
  };

  if (!currentQuestion || !startedAt) {
    return null;
  }

  // Answer box colors
  const answerColors = [
    { border: "border-purple-500", bg: "bg-purple-50", text: "text-purple-900" }, // A
    { border: "border-orange-500", bg: "bg-orange-50", text: "text-orange-900" }, // B
    { border: "border-teal-500", bg: "bg-teal-50", text: "text-teal-900" }, // C
    { border: "border-green-500", bg: "bg-green-50", text: "text-green-900" }, // D
  ];

  const answerLabels = ["A", "B", "C", "D"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-8"
      style={{ minHeight: "100vh" }}
    >
      {/* Top metadata bar */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
        {/* Player count */}
        <div className="text-2xl font-semibold text-gray-700">
          {playerCount} {playerCount === 1 ? "player" : "players"}
        </div>

        {/* Question number and Controls */}
        <div className="flex items-center gap-4">
          <div className="text-2xl font-semibold text-gray-700">
            Question {questionNumber} of {totalQuestions}
          </div>
          
          {/* Host Controls - Small icon next to question number */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
              >
                <Settings className="h-5 w-5 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implement pause game (Story 2.7 or later)
                  toast.info("Pause game - Coming soon");
                }}
                className="cursor-pointer"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Game
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implement skip question (Story 2.7 or later)
                  toast.info("Skip question - Coming soon");
                }}
                className="cursor-pointer"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                Skip Question
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col items-center justify-center max-w-6xl w-full space-y-12">
        {/* Question text */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 text-center leading-tight px-8"
          style={{
            maxHeight: "4.5em", // ~3 lines at 48px
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {currentQuestion.questionText}
        </motion.h1>

        {/* Timer */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <CircularTimer
            duration={timerDuration}
            startedAt={startedAt}
            onExpire={handleTimerExpire}
          />
        </motion.div>

        {/* Answer boxes grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="grid grid-cols-2 gap-6 w-full max-w-4xl"
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`
                ${answerColors[index].border}
                ${answerColors[index].bg}
                border-4 rounded-2xl p-6
                flex items-center space-x-4
                transition-all duration-200
                hover:shadow-lg
              `}
              style={{ minHeight: "120px" }}
            >
              {/* Letter label */}
              <div
                className={`
                  ${answerColors[index].text}
                  text-5xl font-bold
                  flex-shrink-0
                  w-16 h-16
                  flex items-center justify-center
                  rounded-full
                  bg-white
                  border-2
                  ${answerColors[index].border.replace("border-", "border-")}
                `}
              >
                {answerLabels[index]}
              </div>

              {/* Option text */}
              <div
                className={`
                  ${answerColors[index].text}
                  text-3xl font-semibold
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
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

