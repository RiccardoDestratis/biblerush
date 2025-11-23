import { redirect } from "next/navigation";
import { getGame } from "@/lib/actions/games";
import { getPlayerCount } from "@/lib/actions/players";
import { HostGameView } from "@/components/game/host-game-view";

interface HostPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { gameId } = await params;

  // Fetch game from database (Server Component - no client bundle)
  const result = await getGame(gameId);

  if (!result.success) {
    redirect("/create");
  }

  // Allow access to host page even if game is active (for question display)
  // IMPORTANT: Do NOT redirect if game is completed - we want to show final results!
  // The FinalResultsProjector component will handle the display, and users can navigate
  // away manually using the buttons in the final results screen.
  // Only redirect if game doesn't exist or has invalid status
  if (result.game.status !== "waiting" && result.game.status !== "active" && result.game.status !== "completed") {
    redirect("/create");
  }

  // Fetch initial player count on server (optimization: avoid initial client fetch)
  const playerCountResult = await getPlayerCount(gameId);
  const initialPlayerCount = playerCountResult.success ? playerCountResult.count : 0;

  // Get app URL from environment variable
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const joinUrl = `${appUrl}/join?code=${result.game.room_code}`;

  return (
    <HostGameView
      gameId={gameId}
      roomCode={result.game.room_code}
      joinUrl={joinUrl}
      initialPlayerCount={initialPlayerCount}
    />
  );
}


