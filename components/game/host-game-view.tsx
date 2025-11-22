"use client";

import { useGameStore } from "@/lib/store/game-store";
import { HostWaitingRoom } from "@/components/game/host-waiting-room";
import { QuestionDisplayProjector } from "@/components/game/question-display-projector";

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
  const { gameStatus, currentQuestion } = useGameStore();

  // Show question display when game is active and has a question
  if (gameStatus === "active" && currentQuestion) {
    return <QuestionDisplayProjector gameId={gameId} initialPlayerCount={initialPlayerCount} />;
  }

  // Show waiting room otherwise
  return (
    <HostWaitingRoom
      gameId={gameId}
      roomCode={roomCode}
      joinUrl={joinUrl}
    />
  );
}

