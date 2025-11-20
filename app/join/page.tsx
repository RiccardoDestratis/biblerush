import { JoinForm } from "@/components/game/join-form";

interface JoinPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const params = await searchParams;
  const roomCode = params.code || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Join Game</h1>
          <p className="text-muted-foreground text-lg">
            Enter the room code to join a quiz game
          </p>
        </div>

        <JoinForm initialRoomCode={roomCode} />
      </div>
    </div>
  );
}

