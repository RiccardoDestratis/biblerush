"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { cancelGame } from "@/lib/actions/games";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

interface HostWaitingRoomProps {
  gameId: string;
  roomCode: string;
  joinUrl: string;
}

export function HostWaitingRoom({
  gameId,
  roomCode,
  joinUrl,
}: HostWaitingRoomProps) {
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelGame = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel this game? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsCanceling(true);

    try {
      const result = await cancelGame(gameId);

      if (!result.success) {
        toast.error(result.error || "Failed to cancel game. Try again.");
        setIsCanceling(false);
        return;
      }

      toast.success("Game cancelled");
      router.push("/create");
    } catch (error) {
      console.error("Error canceling game:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 flex flex-col items-center justify-center p-8">
      {/* Cancel Game Button - Top Right Corner */}
      <div className="absolute top-4 right-4">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancelGame}
          disabled={isCanceling}
        >
          {isCanceling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Canceling...
            </>
          ) : (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel Game
            </>
          )}
        </Button>
      </div>

      {/* Main Content - Centered */}
      <div className="text-center space-y-8 max-w-4xl w-full">
        {/* Heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-foreground">
          Waiting for Players
        </h1>

        {/* QR Code */}
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-2xl">
            <QRCodeSVG
              value={joinUrl}
              size={300}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Room Code */}
          <div className="space-y-4">
            <p className="text-5xl md:text-6xl font-bold text-foreground">
              Room Code: <span className="text-primary">{roomCode}</span>
            </p>

            {/* Instructions */}
            <p className="text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto">
              Scan QR code or go to{" "}
              <span className="font-mono text-primary">
                {joinUrl.split("/join")[0]}
              </span>
              /join and enter:{" "}
              <span className="font-mono font-bold text-primary">
                {roomCode}
              </span>
            </p>
          </div>
        </div>

        {/* Player List Section */}
        <div className="mt-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
            0 Players Joined
          </h2>
          <p className="text-xl text-muted-foreground">
            Players will appear here when they join...
          </p>
        </div>

        {/* Start Game Button - Disabled */}
        <div className="mt-12">
          <Button
            size="lg"
            disabled
            className="min-w-[300px] h-16 text-xl"
          >
            Start Game
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            (Will be enabled when players join)
          </p>
        </div>
      </div>
    </div>
  );
}

