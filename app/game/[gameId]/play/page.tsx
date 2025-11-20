import { redirect } from "next/navigation";
import { getGame } from "@/lib/actions/games";
import { getPlayers } from "@/lib/actions/players";
import { PlayerWaitingView } from "@/components/game/player-waiting-view";

interface PlayerPageProps {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ playerName?: string; playerId?: string }>;
}

export default async function PlayerPage({
  params,
  searchParams,
}: PlayerPageProps) {
  const { gameId } = await params;
  const search = await searchParams;
  const playerName = search.playerName;
  const playerId = search.playerId;

  // Fetch game from database
  const gameResult = await getGame(gameId);

  if (!gameResult.success) {
    redirect("/join");
  }

  // Fetch players to verify current player is in the game
  const playersResult = await getPlayers(gameId);

  if (!playersResult.success) {
    redirect("/join");
  }

  // Try to find player by ID first (more reliable after rename), then by name
  let player = playerId 
    ? playersResult.players.find((p) => p.id === playerId)
    : null;

  // Fallback to name matching if no ID provided
  if (!player && playerName) {
    player = playersResult.players.find(
      (p) => p.player_name.toLowerCase() === playerName.toLowerCase()
    );
  }

  if (!player) {
    redirect("/join");
  }

  return (
    <PlayerWaitingView
      gameId={gameId}
      playerId={player.id}
      gameStatus={gameResult.game.status}
      playerName={player.player_name}
      playerCount={playersResult.players.length}
      roomCode={gameResult.game.room_code}
    />
  );
}

