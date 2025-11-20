import { redirect } from "next/navigation";
import { getGame } from "@/lib/actions/games";
import { getPlayers } from "@/lib/actions/players";
import { PlayerWaitingView } from "@/components/game/player-waiting-view";

interface PlayerPageProps {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ playerName?: string }>;
}

export default async function PlayerPage({
  params,
  searchParams,
}: PlayerPageProps) {
  const { gameId } = await params;
  const search = await searchParams;
  const playerName = search.playerName;

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

  // For MVP, we'll identify player by name (Epic 5 adds proper auth)
  // If no playerName in URL, we can't identify the player, so redirect
  if (!playerName) {
    redirect("/join");
  }

  // Check if player exists in the game
  const player = playersResult.players.find(
    (p) => p.player_name.toLowerCase() === playerName.toLowerCase()
  );

  if (!player) {
    redirect("/join");
  }

  return (
    <PlayerWaitingView
      gameId={gameId}
      gameStatus={gameResult.game.status}
      playerName={player.player_name}
      playerCount={playersResult.players.length}
      roomCode={gameResult.game.room_code}
    />
  );
}

