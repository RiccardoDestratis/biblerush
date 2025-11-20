import { notFound, redirect } from "next/navigation";
import { getGame } from "@/lib/actions/games";
import { HostWaitingRoom } from "@/components/game/host-waiting-room";

interface HostPageProps {
  params: Promise<{ gameId: string }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { gameId } = await params;

  // Fetch game from database
  const result = await getGame(gameId);

  if (!result.success) {
    redirect("/create");
  }

  // Verify game is in waiting status
  if (result.game.status !== "waiting") {
    redirect("/create");
  }

  // Get app URL from environment variable
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const joinUrl = `${appUrl}/join?code=${result.game.room_code}`;

  return (
    <HostWaitingRoom
      gameId={gameId}
      roomCode={result.game.room_code}
      joinUrl={joinUrl}
    />
  );
}

