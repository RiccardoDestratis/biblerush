"use client";

interface PlayerWaitingViewProps {
  gameId: string;
  gameStatus: string;
  playerName: string;
  playerCount: number;
}

export function PlayerWaitingView({
  gameStatus,
  playerName,
  playerCount,
}: PlayerWaitingViewProps) {
  if (gameStatus === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted via-background to-muted/50">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="space-y-4">
            <h1 className="text-[18px] font-semibold text-foreground">
              Hi, {playerName}!
            </h1>
            <p className="text-[24px] text-foreground">
              Waiting for host to start...
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-base text-muted-foreground">
              {playerCount} {playerCount === 1 ? "player" : "players"} joined
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted via-background to-muted/50">
        <div className="text-center space-y-6 max-w-md w-full">
          <h1 className="text-[24px] font-semibold text-foreground">
            Game starting soon...
          </h1>
          <p className="text-base text-muted-foreground">
            The game is about to begin!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted via-background to-muted/50">
      <div className="text-center space-y-6 max-w-md w-full">
        <h1 className="text-[24px] font-semibold text-foreground">
          Game has ended
        </h1>
        <p className="text-base text-muted-foreground">
          This game is no longer available.
        </p>
      </div>
    </div>
  );
}

