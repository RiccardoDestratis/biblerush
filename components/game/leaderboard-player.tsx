"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLeaderboard } from "@/lib/actions/games";
import { useGameStore } from "@/lib/store/game-store";
import { getSpeedBonus } from "@/lib/game/scoring";

interface LeaderboardPlayerProps {
  gameId: string;
  questionId: string;
  playerId?: string; // Current player's ID (to highlight their row and show speed bonus)
  pointsEarned?: number; // Optional: points earned this question (for message display)
}

interface RankedPlayer {
  playerId: string;
  playerName: string;
  totalScore: number;
  cumulativeResponseTimeMs: number;
  rank: number;
  previousRank?: number;
  pointsEarnedThisQuestion?: number; // Points earned for current question
  responseTimeMs?: number; // Response time for current question
}

/**
 * Leaderboard display component for player view
 * Shows the SAME full leaderboard as projector view (one-to-one match)
 * Just without skip/pause buttons
 */
export function LeaderboardPlayer({
  gameId,
  questionId,
  playerId,
  pointsEarned,
}: LeaderboardPlayerProps) {
  const { questionNumber, totalQuestions, previousRanks, setPreviousRanks } = useGameStore();
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [error, setError] = useState<string | null>(null);
  
  // Check if this is the final question
  const isLastQuestion = questionNumber === totalQuestions;

  // Fetch leaderboard data and current question points
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const result = await getLeaderboard(gameId);
      if (result.success) {
        // Fetch points_earned for current question for each player (to show speed bonus)
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        
        const playersWithQuestionData = await Promise.all(
          result.players.map(async (player) => {
            // Only fetch current question data if this is the current player
            if (playerId && player.playerId === playerId) {
              const { data: answer } = await supabase
                .from("player_answers")
                .select("points_earned, response_time_ms")
                .eq("game_id", gameId)
                .eq("player_id", player.playerId)
                .eq("question_id", questionId)
                .maybeSingle();
              
              return {
                ...player,
                previousRank: previousRanks[player.playerId],
                pointsEarnedThisQuestion: answer?.points_earned ?? undefined,
                responseTimeMs: answer?.response_time_ms ?? undefined,
              };
            }
            
            return {
              ...player,
              previousRank: previousRanks[player.playerId],
            };
          })
        );
        
        setPlayers(playersWithQuestionData);
        setTotalCount(result.totalCount);
        setError(null);

        // Store current ranks as previous for next question - matches projector
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
  }, [gameId, questionId, playerId, previousRanks, setPreviousRanks]);

  // Countdown timer - matches projector timing
  useEffect(() => {
    setCountdown(10);
    
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
  }, [questionId]);

  // Get podium styling for top 3 - matches projector
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

  // Get rank icon - matches projector
  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  // Calculate rank change indicator - matches projector
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

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">
          Unable to load leaderboard. Please try again.
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading leaderboard...</div>
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
      {/* Header - matches projector */}
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

      {/* Main content - matches projector exactly */}
      <div className="flex flex-col items-center justify-center w-full px-4 md:px-8 space-y-4 md:space-y-6 pt-16 md:pt-0 pb-24 md:pb-32">
        {/* Points earned message - show if pointsEarned is provided */}
        {pointsEarned !== undefined && pointsEarned !== null && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            className="text-center mb-4"
          >
            <div className="text-xl md:text-2xl font-bold text-green-600">
              You earned {pointsEarned} point{pointsEarned !== 1 ? 's' : ''} this question!
            </div>
          </motion.div>
        )}

        {/* Leaderboard heading - matches projector */}
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

        {/* Leaderboard rows - matches projector exactly */}
        <div className="w-full space-y-2 md:space-y-3 flex flex-col items-stretch max-w-5xl">
          {players.map((player, index) => {
            const rankChange = getRankChange(player);
            const podiumStyle = getPodiumStyle(player.rank);
            const rankIcon = getRankIcon(player.rank);
            const isCurrentPlayer = playerId && player.playerId === playerId;
            
            // Calculate speed bonus for current player if we have the data
            // Only show speed bonus if there actually is one (> 0)
            let speedBonusText = null;
            if (isCurrentPlayer && player.pointsEarnedThisQuestion !== undefined && player.responseTimeMs !== undefined) {
              const speedBonus = getSpeedBonus(player.responseTimeMs);
              if (speedBonus > 0) {
                speedBonusText = `⚡ +${speedBonus} speed bonus`;
              }
              // Don't show anything if speed bonus is 0
            }

            return (
              <motion.div
                key={player.playerId}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`
                  ${podiumStyle}
                  rounded-xl md:rounded-2xl p-3 md:p-4
                  flex flex-col
                  shadow-lg
                  ${player.rank <= 3 ? "border-2 md:border-4 border-yellow-400" : "border-2 border-gray-300"}
                  ${isCurrentPlayer ? "ring-2 ring-blue-400 ring-offset-2" : ""}
                  w-full
                  min-h-[60px] md:min-h-[80px]
                `}
              >
                <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                  {/* Rank */}
                  <div className="text-2xl md:text-4xl font-bold flex-shrink-0 w-10 md:w-16 text-center">
                    {rankIcon}
                  </div>

                  {/* Player name and speed bonus */}
                  <div className="flex-1 min-w-0">
                    <div className="text-lg md:text-3xl font-bold truncate">{player.playerName}</div>
                    {/* Show speed bonus info only for current player */}
                    {isCurrentPlayer && speedBonusText && (
                      <div className="text-xs md:text-sm text-teal-600 font-semibold mt-1">
                        {speedBonusText}
                      </div>
                    )}
                  </div>

                  {/* Rank change indicator - hide on small screens - matches projector */}
                  <div className={`text-sm md:text-xl font-semibold ${rankChange.color} flex-shrink-0 whitespace-nowrap hidden md:block`}>
                    {rankChange.symbol} {rankChange.text}
                  </div>

                  {/* Score */}
                  <ScoreCounter
                    previousScore={0}
                    currentScore={player.totalScore}
                  />
                </div>
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

      {/* Countdown - matches projector */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 md:gap-4 z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-2 rounded-2xl shadow-lg">
        <div className={`text-base md:text-2xl font-semibold text-center ${
          isLastQuestion ? "text-orange-600 font-bold" : "text-gray-500"
        }`}>
          {isLastQuestion ? (
            <span className="animate-pulse">🏆 Final Results in {countdown}... 🏆</span>
          ) : (
            <>Next question in {countdown}...</>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Score counter component - NO ANIMATION, just display value directly
 */
function ScoreCounter({
  previousScore,
  currentScore,
}: {
  previousScore: number;
  currentScore: number;
}) {
  // No animation - just display the value directly
  return (
    <div className="text-2xl md:text-4xl font-bold flex-shrink-0 w-20 md:w-28 text-right">
      {currentScore}
    </div>
  );
}

