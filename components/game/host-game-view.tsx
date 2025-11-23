"use client";

import { useGameStore } from "@/lib/store/game-store";
import { HostWaitingRoom } from "@/components/game/host-waiting-room";
import { QuestionDisplayProjector } from "@/components/game/question-display-projector";
import { GameErrorBoundary } from "@/components/game/error-boundary";

interface HostGameViewProps {
  gameId: string;
  roomCode: string;
  joinUrl: string;
  initialPlayerCount?: number; // Server-fetched initial count (optimization)
}

/**
 * Host game view wrapper
 * Conditionally renders waiting room or question display based on game status
 */
export function HostGameView({
  gameId,
  roomCode,
  joinUrl,
  initialPlayerCount,
}: HostGameViewProps) {
  const { gameStatus, currentQuestion, revealState } = useGameStore();

  // Show question display when game is active (or ended - for final results)
  // QuestionDisplayProjector handles showing FinalResultsProjector when gameStatus === "ended"
  if ((gameStatus === "active" || gameStatus === "ended") && (currentQuestion || revealState === "results")) {
    return (
      <GameErrorBoundary>
        <QuestionDisplayProjector gameId={gameId} initialPlayerCount={initialPlayerCount} />
      </GameErrorBoundary>
    );
  }

  // Show waiting room otherwise (game is waiting or hasn't started)
  return (
    <GameErrorBoundary>
      <HostWaitingRoom
        gameId={gameId}
        roomCode={roomCode}
        joinUrl={joinUrl}
      />
    </GameErrorBoundary>
  );
}

