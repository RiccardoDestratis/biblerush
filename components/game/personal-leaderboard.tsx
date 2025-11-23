"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { getLeaderboard } from "@/lib/actions/games";
import { useGameStore } from "@/lib/store/game-store";

interface PersonalLeaderboardProps {
  gameId: string;
  playerId: string;
  questionId: string;
  pointsEarned?: number; // Points earned this round (optional, will calculate if not provided)
  previousTotalScore?: number; // Previous total score for calculating points earned
}

interface RankedPlayer {
  playerId: string;
  playerName: string;
  totalScore: number;
  cumulativeResponseTimeMs: number;
  rank: number;
}

/**
 * Personal leaderboard component for player mobile view
 * Shows player's rank, score, and context (top 3 + player's position)
 * Displays for 10 seconds (synced with projector leaderboard)
 */
export function PersonalLeaderboard({
  gameId,
  playerId,
  questionId,
  pointsEarned: propsPointsEarned,
  previousTotalScore,
}: PersonalLeaderboardProps) {
  const { previousRanks, setPreviousRanks, questionNumber, totalQuestions } = useGameStore();
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(propsPointsEarned || 0);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const result = await getLeaderboard(gameId);
      if (result.success) {
        setPlayers(result.players);
        setTotalCount(result.totalCount);
        setError(null);

        // Find player's rank and score
        const player = result.players.find((p) => p.playerId === playerId);
        if (player) {
          setPlayerRank(player.rank);
          setPlayerScore(player.totalScore);
          
          // Calculate points earned this round if not provided
          if (!propsPointsEarned && previousTotalScore !== undefined) {
            setPointsEarned(player.totalScore - previousTotalScore);
          }
          
          // Store current rank as previous for next question (but NOT on first question)
          // On first question, previousRanks should remain empty so rank change doesn't show
          if (questionNumber > 1) {
            const newPreviousRanks: Record<string, number> = {};
            result.players.forEach((p) => {
              newPreviousRanks[p.playerId] = p.rank;
            });
            setPreviousRanks(newPreviousRanks);
          }
        } else {
          // Player not in top 10, need to find their rank
          // For now, set a placeholder
          setPlayerRank(null);
        }
      } else {
        setError(result.error);
      }
    };

    fetchLeaderboard();
  }, [gameId, questionId, playerId, propsPointsEarned, previousTotalScore]);

  // Countdown timer
  useEffect(() => {
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
  }, []);

  // Calculate rank change using Zustand store
  const getRankChange = () => {
    const previousRank = previousRanks[playerId];
    // If no previous rank, this is the first question - don't show rank change
    if (previousRank === undefined || playerRank === null) {
      return null; // Return null to hide rank change on first question
    }
    const change = previousRank - playerRank;
    if (change > 0) {
      return {
        symbol: "↑",
        text: `Moved up ${change} place${change > 1 ? "s" : ""}!`,
        color: "text-green-600",
      };
    } else if (change < 0) {
      return {
        symbol: "↓",
        text: `Moved down ${Math.abs(change)} place${Math.abs(change) > 1 ? "s" : ""}`,
        color: "text-red-600",
      };
    } else {
      return {
        symbol: "—",
        text: `Stayed in ${playerRank}${getOrdinalSuffix(playerRank)}`,
        color: "text-gray-600",
      };
    }
  };

  // Get encouraging message based on rank
  const getEncouragingMessage = () => {
    if (playerRank === null || totalCount === 0) return null;

    const percentile = (playerRank / totalCount) * 100;
    if (playerRank <= 3) {
      return { text: "Great job! You're on the podium!", color: "text-green-600" };
    } else if (percentile <= 50) {
      return { text: "Keep it up! You're doing well!", color: "text-teal-600" };
    } else {
      return { text: "You can do it! Stay focused!", color: "text-orange-600" };
    }
  };

  // Get ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (n: number) => {
    const j = n % 10;
    const k = n % 100;
    if (j === 1 && k !== 11) return "st";
    if (j === 2 && k !== 12) return "nd";
    if (j === 3 && k !== 13) return "rd";
    return "th";
  };

  // Get top 3 players
  const top3Players = players.filter((p) => p.rank <= 3);

  // Get context players (player above, current player, player below)
  const getContextPlayers = () => {
    if (playerRank === null || playerRank <= 3) {
      return []; // Player is in top 3, no context needed
    }

    const playerIndex = players.findIndex((p) => p.playerId === playerId);
    if (playerIndex === -1) {
      // Player not in top 10, return empty (would need full leaderboard)
      return [];
    }

    const context: RankedPlayer[] = [];
    if (playerIndex > 0) {
      context.push(players[playerIndex - 1]); // Player above
    }
    context.push(players[playerIndex]); // Current player
    if (playerIndex < players.length - 1) {
      context.push(players[playerIndex + 1]); // Player below
    }

    return context;
  };

  const contextPlayers = getContextPlayers();
  const rankChange = getRankChange();
  const encouragingMessage = getEncouragingMessage();

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-xl font-bold text-red-600 text-center">
          Unable to load leaderboard. Please try again.
        </div>
      </div>
    );
  }

  if (playerRank === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-xl font-bold text-gray-600 text-center">
          Your rank could not be determined
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen flex flex-col p-4 ${
        questionNumber === totalQuestions
          ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Personal Stats Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center space-y-3"
        >
          {questionNumber === totalQuestions && (
            <div className="text-2xl font-bold text-orange-600 mb-2 animate-pulse">
              🏆 Final Question Complete! 🏆
            </div>
          )}
          <h1 className={`text-3xl font-bold ${
            questionNumber === totalQuestions ? 'text-orange-900' : 'text-gray-900'
          }`}>
            You&apos;re in {playerRank}
            {getOrdinalSuffix(playerRank)} place!
          </h1>

          {rankChange && (
            <div className={`text-xl font-semibold ${rankChange.color}`}>
              {rankChange.symbol} {rankChange.text}
            </div>
          )}

          <ScoreCounter
            previousScore={playerScore - pointsEarned}
            currentScore={playerScore}
          />

          {pointsEarned > 0 && (
            <div className="text-lg text-green-600 font-semibold">
              +{pointsEarned} points
            </div>
          )}

          {encouragingMessage && (
            <div className={`text-lg font-semibold ${encouragingMessage.color}`}>
              {encouragingMessage.text}
            </div>
          )}
        </motion.div>

        {/* Top 3 Podium */}
        {top3Players.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="space-y-3"
          >
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Top 3 Players
            </h2>
            {top3Players.map((player) => {
              const isPlayer = player.playerId === playerId;
              const medal = player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉";

              return (
                <div
                  key={player.playerId}
                  className={`
                    rounded-xl p-4
                    flex items-center justify-between
                    ${isPlayer ? "bg-purple-500 text-white" : "bg-white text-gray-900"}
                    shadow-lg
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{medal}</span>
                    <div>
                      <div className="text-2xl font-bold">{player.playerName}</div>
                      <div className="text-2xl font-bold">{player.totalScore} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Context Leaderboard (if player not in top 3) */}
        {contextPlayers.length > 0 && playerRank > 3 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-xl font-bold text-gray-900 text-center">
              Around You
            </h2>
            {contextPlayers.map((player) => {
              const isPlayer = player.playerId === playerId;

              return (
                <div
                  key={player.playerId}
                  className={`
                    rounded-xl p-3
                    flex items-center justify-between
                    ${isPlayer ? "bg-purple-500 text-white" : "bg-white text-gray-900"}
                    shadow-md
                  `}
                >
                  <div className="text-xl font-semibold">
                    {player.rank}. {player.playerName}
                  </div>
                  <div className="text-xl font-bold">{player.totalScore} pts</div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Countdown - Show different message for final question */}
        {questionNumber === totalQuestions ? (
          <div className="text-center text-base text-orange-600 font-bold">
            🏆 Final Results in {countdown}... 🏆
          </div>
        ) : (
          <div className="text-center text-base text-gray-500">
            Next question in {countdown}...
          </div>
        )}
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
    <motion.div className="text-3xl font-bold text-gray-900">
      <motion.span>{displayScore}</motion.span> points
    </motion.div>
  );
}

