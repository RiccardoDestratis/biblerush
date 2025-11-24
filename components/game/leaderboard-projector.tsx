"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { getLeaderboard } from "@/lib/actions/games";
import { useGameStore } from "@/lib/store/game-store";
import { getGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { GameEndPayload, GamePausePayload, GameResumePayload } from "@/lib/types/realtime";
import { CircularTimer } from "@/components/game/circular-timer";
import { Pause, Play, SkipForward } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardProjectorProps {
  gameId: string;
  questionId: string;
  onComplete?: () => void; // Called when leaderboard countdown finishes
}

interface RankedPlayer {
  playerId: string;
  playerName: string;
  totalScore: number;
  cumulativeResponseTimeMs: number;
  rank: number;
  previousRank?: number;
}

/**
 * Leaderboard display component for projector view
 * Shows top 10 players with rankings, scores, and rank change indicators
 * Displays for 10 seconds before advancing to next question
 */
export function LeaderboardProjector({
  gameId,
  questionId,
  onComplete,
}: LeaderboardProjectorProps) {
  const { questionNumber, totalQuestions, previousRanks, setPreviousRanks, isPaused, pausedAt, setPaused, setResumed } = useGameStore();
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false); // Track advancement state
  const isAdvancingRef = useRef(false); // Prevent multiple advancement calls
  const [timerStartTime, setTimerStartTime] = useState(() => new Date().toISOString());
  const [isCountdownPaused, setIsCountdownPaused] = useState(false);
  const isCountdownPausedRef = useRef(false); // Use ref to avoid dependency issues
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete); // Use ref to avoid dependency issues
  
  // Keep ref in sync with prop
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Check if this is the final question
  const isLastQuestion = questionNumber === totalQuestions;

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const result = await getLeaderboard(gameId);
      if (result.success) {
        // Add previous ranks for rank change calculation
        const playersWithPreviousRanks = result.players.map((player) => ({
          ...player,
          previousRank: previousRanks[player.playerId],
        }));
        setPlayers(playersWithPreviousRanks);
        setTotalCount(result.totalCount);
        setError(null);

        // Store current ranks as previous for next question
        const newPreviousRanks: Record<string, number> = {};
        result.players.forEach((player) => {
          newPreviousRanks[player.playerId] = player.rank;
        });
        setPreviousRanks(newPreviousRanks);
      } else {
        setError(result.error);
      }
    };

    fetchLeaderboard();
  }, [gameId, questionId, previousRanks, setPreviousRanks]);

  // Handle leaderboard countdown completion - same pattern as reveal component
  // Use ref to avoid dependency issues that cause infinite loops
  const handleCountdownComplete = useCallback(() => {
    if (isAdvancingRef.current) {
      return;
    }
    isAdvancingRef.current = true;
    setIsAdvancing(true);
    console.log(`[Leaderboard] Leaderboard countdown finished (10s), calling onComplete...`);
    onCompleteRef.current?.(); // Call parent's handler using ref
  }, []); // Empty deps - use ref instead

  // Leaderboard countdown timer - advances question after 10 seconds
  useEffect(() => {
    console.log(`[Leaderboard] ⏱️ Starting countdown timer for question ${questionId}, onComplete provided: ${!!onComplete}`);
    setCountdown(10);
    setTimerStartTime(new Date().toISOString()); // Reset timer start time when question changes
    isAdvancingRef.current = false;
    setIsAdvancing(false);
    setIsCountdownPaused(false);
    isCountdownPausedRef.current = false;
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        // Check pause state using ref to avoid dependency issues
        if (isCountdownPausedRef.current) {
          return prev; // Don't decrement if paused
        }
        console.log(`[Leaderboard] ⏱️ Countdown: ${prev}`);
        if (prev <= 1) {
          console.log(`[Leaderboard] ⏱️ Countdown reached zero!`);
          clearInterval(timer);
          handleCountdownComplete(); // Call onComplete when leaderboard countdown reaches zero
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    countdownIntervalRef.current = timer;

    return () => {
      console.log(`[Leaderboard] 🧹 Cleaning up countdown timer`);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [questionId, handleCountdownComplete]); // Reset timer when question changes - removed isCountdownPaused to prevent infinite loops

  // Handle pause button click
  const handlePause = async () => {
    const channel = getGameChannel(gameId);
    if (!channel) return;
    
    const pausedAt = new Date().toISOString();
    const payload: GamePausePayload = { pausedAt };
    
    // Update local state immediately
    setPaused(pausedAt);
    setIsCountdownPaused(true);
    isCountdownPausedRef.current = true;
    
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
    isCountdownPausedRef.current = false;
    
    // Broadcast to all devices
    await broadcastGameEvent(gameId, "game_resume", payload);
    toast.success("Game resumed");
  };

  // Handle skip button click - advance to next question
  const handleSkip = useCallback(() => {
    if (isAdvancingRef.current) {
      return;
    }
    isAdvancingRef.current = true;
    setIsAdvancing(true);
    console.log(`[Leaderboard] ⏭️ Skip button clicked, advancing to next question...`);
    onCompleteRef.current?.(); // Call parent's handler using ref
  }, []); // Empty deps - use ref instead

  // Calculate rank change indicator
  const getRankChange = (player: RankedPlayer) => {
    if (player.previousRank === undefined) {
      return { symbol: "→", color: "text-blue-600", text: "new player" };
    }
    const change = player.previousRank - player.rank;
    if (change > 0) {
      return {
        symbol: "↑",
        color: "text-green-600",
        text: `Moved up ${change} place${change > 1 ? "s" : ""}`,
      };
    } else if (change < 0) {
      return {
        symbol: "↓",
        color: "text-red-600",
        text: `Moved down ${Math.abs(change)} place${Math.abs(change) > 1 ? "s" : ""}`,
      };
    } else {
      return { symbol: "—", color: "text-gray-600", text: "Stayed same" };
    }
  };

  // Get podium styling for top 3
  const getPodiumStyle = (rank: number) => {
    if (rank === 1) {
      return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white";
    } else if (rank === 2) {
      return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white";
    } else if (rank === 3) {
      return "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white";
    }
    return "bg-white text-gray-900";
  };

  // Get rank icon
  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-red-600">
          Unable to load leaderboard. Please try again.
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-600">No players in game</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto ${
        isLastQuestion
          ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      }`}
      style={{ minHeight: "100vh" }}
    >
      {/* Header */}
      <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-0 z-10">
        <div className="text-lg md:text-2xl font-semibold text-gray-700">
          {totalCount} {totalCount === 1 ? "player" : "players"}
        </div>
        <div className="text-lg md:text-2xl font-semibold text-gray-700">
          {isLastQuestion ? (
            <span className="text-orange-600 font-bold">🏆 Final Question Complete!</span>
          ) : (
            <>After Question {questionNumber} of {totalQuestions}</>
          )}
        </div>
      </div>

      {/* Main content - full width, responsive */}
      <div className="flex flex-col items-center justify-center w-full px-4 md:px-8 space-y-4 md:space-y-6 pt-16 md:pt-0 pb-24 md:pb-32">
        {/* Leaderboard heading - Special styling for final question */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text ${
            isLastQuestion
              ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-pulse"
              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"
          }`}
        >
          {isLastQuestion ? "🏆 Final Leaderboard 🏆" : "Leaderboard"}
        </motion.h1>

        {/* Leaderboard rows - responsive, no scrolling, full width */}
        <div className="w-full space-y-2 md:space-y-3 flex flex-col items-stretch max-w-5xl">
          {players.map((player, index) => {
            const rankChange = getRankChange(player);
            const podiumStyle = getPodiumStyle(player.rank);
            const rankIcon = getRankIcon(player.rank);

            return (
              <motion.div
                key={player.playerId}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`
                  ${podiumStyle}
                  rounded-xl md:rounded-2xl p-3 md:p-4
                  flex items-center justify-between
                  shadow-lg
                  ${player.rank <= 3 ? "border-2 md:border-4 border-yellow-400" : "border-2 border-gray-300"}
                  w-full
                  min-h-[60px] md:min-h-[80px]
                `}
              >
                <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                  {/* Rank */}
                  <div className="text-2xl md:text-4xl font-bold flex-shrink-0 w-10 md:w-16 text-center">
                    {rankIcon}
                  </div>

                  {/* Player name */}
                  <div className="text-lg md:text-3xl font-bold flex-1 truncate min-w-0">{player.playerName}</div>

                  {/* Rank change indicator - hide on small screens */}
                  <div className={`text-sm md:text-xl font-semibold ${rankChange.color} flex-shrink-0 whitespace-nowrap hidden md:block`}>
                    {rankChange.symbol} {rankChange.text}
                  </div>
                </div>

                {/* Score (animated count-up) */}
                <ScoreCounter
                  previousScore={0} // Start from 0 for animation effect
                  currentScore={player.totalScore}
                />
              </motion.div>
            );
          })}
        </div>

        {/* "and X more" if >10 players */}
        {totalCount > 10 && (
          <div className="text-base md:text-xl text-gray-600 text-center">
            ...and {totalCount - 10} more player{totalCount - 10 > 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Leaderboard countdown with CircularTimer - positioned at bottom, not overlapping */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 md:gap-4 z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-2 rounded-2xl shadow-lg">
        {/* Circular Timer */}
        <div className="scale-75 md:scale-100">
          <CircularTimer
            duration={10}
            startedAt={timerStartTime}
            onExpire={handleCountdownComplete}
            isPaused={isCountdownPaused}
          />
        </div>
        
        {/* Text countdown */}
        <div className={`text-base md:text-2xl font-semibold text-center ${
          isLastQuestion ? "text-orange-600 font-bold" : "text-gray-500"
        }`}>
          {isAdvancing ? (
            <span className="text-blue-600">Loading {isLastQuestion ? "final results" : "next question"}...</span>
          ) : (
            <>
              {isLastQuestion ? (
                <span className="animate-pulse">🏆 Final Results in {countdown}... 🏆</span>
              ) : (
                <>Next question in {countdown}...</>
              )}
            </>
          )}
        </div>
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
    </motion.div>
  );
}

/**
 * Score counter component with animated count-up
 */
function ScoreCounter({
  previousScore,
  currentScore,
}: {
  previousScore: number;
  currentScore: number;
}) {
  const motionValue = useMotionValue(previousScore);
  const springValue = useSpring(motionValue, {
    stiffness: 50,
    damping: 30,
  });
  const displayScore = useTransform(springValue, (value) =>
    Math.floor(value)
  );

  useEffect(() => {
    motionValue.set(currentScore);
  }, [currentScore, motionValue]);

  return (
    <motion.div className="text-2xl md:text-4xl font-bold flex-shrink-0 w-20 md:w-28 text-right">
      {displayScore}
    </motion.div>
  );
}

