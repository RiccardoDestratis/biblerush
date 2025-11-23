"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPlayerFinalResults } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";
import { formatResponseTime } from "@/lib/game/scoring";

interface FinalResultsPlayerProps {
  gameId: string;
  playerId: string;
}

interface TopPlayer {
  playerId: string;
  playerName: string;
  totalScore: number;
  cumulativeResponseTimeMs: number;
  rank: number;
}

/**
 * Final results display component for player mobile view
 * Shows player's final rank, score, accuracy, average response time, top 3, and encouraging message
 */
export function FinalResultsPlayer({
  gameId,
  playerId,
}: FinalResultsPlayerProps) {
  const router = useRouter();
  const [playerRank, setPlayerRank] = useState<number | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<{
    correct: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [averageResponseTime, setAverageResponseTime] = useState<number>(0);
  const [top3Players, setTop3Players] = useState<TopPlayer[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winner, setWinner] = useState<TopPlayer | null>(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Fetch final results
  useEffect(() => {
    const fetchFinalResults = async () => {
      const result = await getPlayerFinalResults(gameId, playerId);
      if (result.success) {
        setPlayerRank(result.playerRank);
        setPlayerScore(result.playerScore);
        setAccuracy(result.accuracy);
        setAverageResponseTime(result.averageResponseTime);
        setTop3Players(result.top3Players);
        setTotalPlayers(result.totalPlayers);
        // Set winner (first player in top3 is always the winner)
        if (result.top3Players.length > 0 && result.top3Players[0].rank === 1) {
          setWinner(result.top3Players[0]);
        } else if (result.top3Players.length > 0) {
          // If top3 doesn't have rank 1, winner might not be in top3, but we still want to show celebration
          // For now, use first player as placeholder (will be fixed when we get full results)
          setWinner(result.top3Players[0]);
        }
        setError(null);

        // Show confetti for all players (celebration)
        setShowConfetti(true);
        // Hide confetti after 2 seconds
        setTimeout(() => setShowConfetti(false), 2000);
      } else {
        setError(result.error);
      }
    };

    fetchFinalResults();
  }, [gameId, playerId]);

  // Show celebration for 3 seconds, then transition to results (same as projector)
  // Show celebration even if winner isn't loaded yet (will show once winner is available)
  useEffect(() => {
    if (playerRank !== null) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowResults(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [playerRank]);

  // Get encouraging message based on rank
  const getEncouragingMessage = () => {
    if (playerRank === null || totalPlayers === 0) return null;

    if (playerRank <= 3) {
      return {
        text: "Outstanding! You're a Bible quiz champion!",
        color: "text-green-600",
      };
    }

    const percentile = (playerRank / totalPlayers) * 100;
    if (percentile <= 50) {
      return {
        text: "Great job! You know your Bible well!",
        color: "text-teal-600",
      };
    }

    return {
      text: "Keep studying! You'll do better next time!",
      color: "text-orange-600",
    };
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-xl font-bold text-red-600 text-center">
          Unable to load final results. Please try again.
        </div>
      </div>
    );
  }

  if (playerRank === null || !accuracy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-xl font-bold text-gray-600 text-center">
          Loading results...
        </div>
      </div>
    );
  }

  const encouragingMessage = getEncouragingMessage();
  const isTop3 = playerRank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50 flex flex-col p-4 relative overflow-hidden"
    >
      {/* Confetti for all players */}
      <AnimatePresence>
        {showConfetti && <MiniConfetti />}
      </AnimatePresence>

      {/* Winner Celebration Phase (3 seconds) - same as projector */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-6 absolute inset-0"
          >
            {/* Game Over Heading */}
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600 text-center"
            >
              Game Over!
            </motion.h1>

            {/* Winner Celebration */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center gap-4"
            >
              <Trophy className="w-20 h-20 md:w-24 md:h-24 text-yellow-500" />
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-center"
              >
                {winner ? `${winner.playerName} Wins! 🏆` : "Game Complete! 🏆"}
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Phase (after celebration) */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full mx-auto space-y-6 flex-1 flex flex-col justify-center"
          >
            {/* Final Rank Section */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-center space-y-3"
            >
              <h1 className="text-4xl font-bold text-gray-900">
                You finished in {playerRank}
                {getOrdinalSuffix(playerRank)} place!
              </h1>

              {encouragingMessage && (
                <div className={`text-xl font-semibold ${encouragingMessage.color}`}>
                  {encouragingMessage.text}
                </div>
              )}
            </motion.div>

        {/* Final Score Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="space-y-4 bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-gray-900">
              Final Score: {playerScore} points
            </div>
            <div className="text-lg text-gray-700">
              Accuracy: {accuracy.correct}/{accuracy.total} correct - {accuracy.percentage}%
            </div>
            <div className="text-base text-gray-600">
              Average response time: {formatResponseTime(averageResponseTime * 1000)}
            </div>
          </div>
        </motion.div>

        {/* Top 3 Players Section */}
        {top3Players.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
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
                    ${isPlayer ? "border-4 border-purple-300" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{medal}</span>
                    <div>
                      <div className="text-2xl font-bold">{player.playerName}</div>
                      <div className="text-xl font-semibold">{player.totalScore} pts</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Play Again Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={() => router.push("/join")}
            size="lg"
            className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Play className="h-6 w-6 mr-3" />
            Play Again
          </Button>
        </motion.div>
      </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Mini confetti particles animation component for top 3 players
 * Smaller particle count for mobile performance
 */
function MiniConfetti() {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  const colors = ["#22c55e", "#14b8a6", "#f97316"]; // Green, teal, coral

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${(i * 11) % 100}%`,
            top: `${(i * 7) % 40}%`,
          }}
          initial={{
            y: -50,
            x: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: 800, // Fallback for SSR
            x: (Math.random() - 0.5) * 100,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0.8, 0.5, 0],
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

