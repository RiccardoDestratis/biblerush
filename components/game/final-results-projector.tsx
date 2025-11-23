"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { getFinalResults } from "@/lib/actions/games";
import { Button } from "@/components/ui/button";

interface FinalResultsProjectorProps {
  gameId: string;
}

interface RankedPlayer {
  playerId: string;
  playerName: string;
  totalScore: number;
  cumulativeResponseTimeMs: number;
  rank: number;
}

/**
 * Final results display component for projector view
 * Shows winner celebration with confetti, full leaderboard, and game stats
 */
export function FinalResultsProjector({
  gameId,
}: FinalResultsProjectorProps) {
  const router = useRouter();
  const [winner, setWinner] = useState<RankedPlayer | null>(null);
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [gameStats, setGameStats] = useState<{
    totalQuestions: number;
    gameDurationMinutes: number;
    averageScore: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Fetch final results
  useEffect(() => {
    const fetchFinalResults = async () => {
      console.log(`[FinalResults] 🔍 Fetching final results for game ${gameId}...`);
      try {
        const result = await getFinalResults(gameId);
        console.log(`[FinalResults] 📥 API response:`, { success: result.success, error: result.success ? undefined : result.error });
        if (result.success) {
          console.log(`[FinalResults] ✅ Results fetched: winner=${result.winner.playerName}, players=${result.players.length}, stats=${JSON.stringify(result.gameStats)}`);
          setWinner(result.winner);
          setPlayers(result.players);
          setGameStats(result.gameStats);
          setError(null);
        } else {
          console.error(`[FinalResults] ❌ Failed to fetch results: ${result.error}`);
          setError(result.error);
        }
      } catch (err) {
        console.error(`[FinalResults] ❌ Exception fetching results:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    fetchFinalResults();
  }, [gameId]);

  // Show celebration for 3 seconds, then transition to leaderboard
  useEffect(() => {
    if (winner) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowLeaderboard(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [winner]);

  // Get podium styling for top 3
  const getPodiumStyle = (rank: number) => {
    if (rank === 1) {
      return "bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 text-white border-4 border-yellow-300";
    } else if (rank === 2) {
      return "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white border-4 border-gray-200";
    } else if (rank === 3) {
      return "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-white border-4 border-amber-600";
    }
    return "bg-white text-gray-900 border-2 border-gray-300";
  };

  // Get rank icon
  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  if (error) {
    console.error(`[FinalResults] ❌ Error state: ${error}`);
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-red-600">
          Unable to load final results. Please try again.
        </div>
        <div className="text-xl text-gray-500 mt-4">Error: {error}</div>
      </div>
    );
  }

  if (!winner || !gameStats) {
    console.log(`[FinalResults] ⏳ Loading state: winner=${!!winner}, gameStats=${!!gameStats}`);
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-600">Loading results...</div>
        <div className="text-xl text-gray-500 mt-4">Fetching game data...</div>
      </div>
    );
  }
  
  console.log(`[FinalResults] ✅ Rendering final results: winner=${winner.playerName}, players=${players.length}`);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-teal-50 flex flex-col items-center justify-center p-8 overflow-y-auto"
      style={{ minHeight: "100vh" }}
    >
      {/* Winner Celebration Phase (3 seconds) */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-8 absolute inset-0"
          >
            {/* Confetti Particles */}
            <ConfettiParticles />

            {/* Game Over Heading */}
            <motion.h1
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-teal-600"
            >
              Game Over!
            </motion.h1>

            {/* Winner Celebration */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center gap-6"
            >
              <Trophy className="w-32 h-32 text-yellow-500" />
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
              >
                {winner.playerName} Wins! 🏆
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Leaderboard Phase (after celebration) */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-6xl space-y-8"
          >
            {/* Game Stats */}
            <div className="flex justify-center gap-12 text-2xl font-semibold text-gray-700">
              <div>📊 {gameStats.totalQuestions} questions</div>
              <div>⏱️ {gameStats.gameDurationMinutes} minutes</div>
              <div>📈 {gameStats.averageScore} avg score</div>
            </div>

            {/* Full Leaderboard */}
            <div className="space-y-4">
              <h2 className="text-6xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                Final Leaderboard
              </h2>

              {/* Podium Section for Top 3 */}
              {players.length >= 3 && (
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[2, 1, 3].map((rank) => {
                    const player = players.find((p) => p.rank === rank);
                    if (!player) return null;

                    const isWinner = rank === 1;
                    const height = isWinner ? "h-48" : rank === 2 ? "h-40" : "h-32";

                    return (
                      <motion.div
                        key={player.playerId}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: rank === 1 ? 0.2 : rank === 2 ? 0.1 : 0.3, duration: 0.5 }}
                        className={`${getPodiumStyle(rank)} ${height} rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 shadow-2xl`}
                      >
                        <div className="text-6xl">{getRankIcon(rank)}</div>
                        <div className="text-3xl font-bold text-center">
                          {player.playerName}
                        </div>
                        <div className="text-2xl font-bold">{player.totalScore} pts</div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* All Players List (scrollable if >15 players) */}
              <div className="max-h-[600px] overflow-y-auto space-y-3 pr-4">
                {players.map((player, index) => (
                  <motion.div
                    key={player.playerId}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className={`${getPodiumStyle(player.rank)} rounded-xl p-4 flex items-center justify-between shadow-lg`}
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div className="text-4xl font-bold flex-shrink-0 w-16 text-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="text-3xl font-bold flex-1 truncate">
                        {player.playerName}
                      </div>
                    </div>
                    <div className="text-3xl font-bold flex-shrink-0">
                      {player.totalScore} pts
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8">
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                variant="outline"
                className="h-16 px-12 text-2xl font-semibold border-2"
              >
                <LayoutDashboard className="h-8 w-8 mr-3" />
                Dashboard
              </Button>

              <Button
                onClick={() => router.push("/create")}
                size="lg"
                className="h-16 px-12 text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Play className="h-8 w-8 mr-3" />
                Play Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Confetti particles animation component
 * Uses Framer Motion for smooth, accessible animations
 */
function ConfettiParticles() {
  const particles = Array.from({ length: 50 }, (_, i) => i);
  const colors = ["#a855f7", "#f97316", "#14b8a6", "#ec4899", "#8b5cf6"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${(i * 7) % 100}%`,
            top: `${(i * 13) % 20}%`,
          }}
          initial={{
            y: -100,
            x: 0,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: 1200, // Fallback height for SSR, will work on client
            x: (Math.random() - 0.5) * 200,
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
            opacity: [1, 1, 0.8, 0.5, 0],
          }}
          transition={{
            duration: 3,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

