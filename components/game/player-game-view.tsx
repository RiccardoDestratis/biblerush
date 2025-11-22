"use client";

import { useGameStore } from "@/lib/store/game-store";
import { PlayerWaitingView } from "@/components/game/player-waiting-view";
import { QuestionDisplayPlayer } from "@/components/game/question-display-player";

interface PlayerGameViewProps {
  gameId: string;
  playerId: string;
  gameStatus: string;
  playerName: string;
  playerCount: number;
  roomCode: string;
}

/**
 * Player game view wrapper
 * Conditionally renders waiting room or question display based on game status
 */
export function PlayerGameView({
  gameId,
  playerId,
  gameStatus: initialGameStatus,
  playerName,
  playerCount,
  roomCode,
}: PlayerGameViewProps) {
  const { gameStatus, currentQuestion } = useGameStore();

  // Use store status if available, otherwise fall back to initial status
  const activeGameStatus = gameStatus || initialGameStatus;

  // Show question display when game is active and has a question
  if (activeGameStatus === "active" && currentQuestion) {
    return <QuestionDisplayPlayer gameId={gameId} playerId={playerId} />;
  }

  // Show waiting room otherwise
  return (
    <PlayerWaitingView
      gameId={gameId}
      playerId={playerId}
      gameStatus={initialGameStatus}
      playerName={playerName}
      playerCount={playerCount}
      roomCode={roomCode}
    />
  );
}

