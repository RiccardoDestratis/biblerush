"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { cancelGame } from "@/lib/actions/games";
import { getPlayerCount, getPlayers } from "@/lib/actions/players";
import { toast } from "sonner";
import { Loader2, X, RefreshCw } from "lucide-react";

interface HostWaitingRoomProps {
  gameId: string;
  roomCode: string;
  joinUrl: string;
}

export function HostWaitingRoom({
  gameId,
  roomCode,
  joinUrl: initialJoinUrl,
}: HostWaitingRoomProps) {
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);
  const [joinUrl, setJoinUrl] = useState(initialJoinUrl);
  const [networkUrl, setNetworkUrl] = useState<string | null>(null);
  const [isLoadingNetworkUrl, setIsLoadingNetworkUrl] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<Array<{ id: string; player_name: string }>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch network URL from API to get the actual network IP
  useEffect(() => {
    const fetchNetworkUrl = async () => {
      try {
        const response = await fetch("/api/network-url");
        const data = await response.json();
        
        if (data.networkUrl) {
          const newJoinUrl = `${data.networkUrl}/join?code=${roomCode}`;
          setJoinUrl(newJoinUrl);
          setNetworkUrl(data.networkUrl);
        } else {
          // Fallback to current origin
          const currentOrigin = window.location.origin;
          setJoinUrl(`${currentOrigin}/join?code=${roomCode}`);
          setNetworkUrl(currentOrigin);
        }
      } catch (error) {
        console.error("Error fetching network URL:", error);
        // Fallback to current origin
        const currentOrigin = window.location.origin;
        setJoinUrl(`${currentOrigin}/join?code=${roomCode}`);
        setNetworkUrl(currentOrigin);
      } finally {
        setIsLoadingNetworkUrl(false);
      }
    };

    fetchNetworkUrl();
    fetchPlayers();
    
    // Refresh player list every 3 seconds (real-time updates come in Epic 2)
    const interval = setInterval(() => {
      fetchPlayers();
    }, 3000);

    return () => clearInterval(interval);
  }, [roomCode, gameId]);

  const fetchPlayers = async () => {
    setIsRefreshing(true);
    try {
      const countResult = await getPlayerCount(gameId);
      const playersResult = await getPlayers(gameId);
      
      if (countResult.success) {
        setPlayerCount(countResult.count);
      }
      
      if (playersResult.success) {
        setPlayers(playersResult.players);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
            {isLoadingNetworkUrl ? (
              <div className="w-[300px] h-[300px] flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <QRCodeSVG
                value={joinUrl}
                size={300}
                level="H"
                includeMargin={true}
              />
            )}
          </div>

          {/* Room Code */}
          <div className="space-y-4">
            <p className="text-5xl md:text-6xl font-bold text-foreground">
              Room Code: <span className="text-primary">{roomCode}</span>
            </p>

            {/* Instructions */}
            <div className="space-y-2">
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
              {networkUrl && (networkUrl.includes("localhost") || networkUrl.includes("127.0.0.1")) && (
                <p className="text-lg text-yellow-600 dark:text-yellow-400 max-w-2xl mx-auto">
                  💡 Dev tip: QR code will use network IP automatically. Access via network IP to test on mobile.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Player List Section */}
        <div className="mt-12 space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              {playerCount} {playerCount === 1 ? "Player" : "Players"} Joined
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchPlayers}
              disabled={isRefreshing}
              className="h-10 w-10"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
          
          {players.length > 0 ? (
            <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-background/50 backdrop-blur-sm rounded-lg p-4 text-left border border-primary/20"
                >
                  <p className="text-xl font-medium text-foreground">
                    {index + 1}. {player.player_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xl text-muted-foreground">
              Players will appear here when they join...
            </p>
          )}
        </div>

        {/* Start Game Button - Disabled */}
        <div className="mt-12">
          <Button
            size="lg"
            disabled={playerCount === 0}
            className="min-w-[300px] h-16 text-xl"
          >
            Start Game
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {playerCount === 0
              ? "(Will be enabled when players join)"
              : `Ready to start with ${playerCount} ${playerCount === 1 ? "player" : "players"}`}
          </p>
        </div>
      </div>
    </div>
  );
}

