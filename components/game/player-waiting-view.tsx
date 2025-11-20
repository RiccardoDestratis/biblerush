"use client";

import { useState, useEffect, useRef } from "react";
import { createGameChannel, subscribeToGameChannel } from "@/lib/supabase/realtime";
import type { PlayerJoinedPayload } from "@/lib/types/realtime";
import { getPlayerCount, getPlayers } from "@/lib/actions/players";
import { PlayerList } from "@/components/game/player-list";

interface PlayerWaitingViewProps {
  gameId: string;
  gameStatus: string;
  playerName: string;
  playerCount: number;
  roomCode: string;
}

export function PlayerWaitingView({
  gameId,
  gameStatus,
  playerName,
  playerCount: initialPlayerCount,
  roomCode,
}: PlayerWaitingViewProps) {
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [players, setPlayers] = useState<Array<{ id: string; player_name: string }>>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const processedPlayerIdsRef = useRef<Set<string>>(new Set());

  // Set up real-time subscription for player count updates
  useEffect(() => {
    if (gameStatus !== "waiting") {
      return; // Only subscribe when game is waiting
    }

    // Fetch initial players
    const fetchInitialPlayers = async () => {
      try {
        const countResult = await getPlayerCount(gameId);
        const playersResult = await getPlayers(gameId);
        
        if (countResult.success) {
          setPlayerCount(countResult.count);
        }
        
        if (playersResult.success) {
          setPlayers(playersResult.players);
          // Mark existing players as processed to avoid duplicate counts
          playersResult.players.forEach((p) => {
            processedPlayerIdsRef.current.add(p.id);
          });
        }
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchInitialPlayers();

    // Create game channel for real-time updates
    const channel = createGameChannel(gameId);

    // Reset processed IDs when game changes
    processedPlayerIdsRef.current = new Set();

    // Handle player joined event (update count and players list)
    const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
      // Check if we've already processed this player (avoid duplicates from broadcast + DB event)
      if (processedPlayerIdsRef.current.has(payload.playerId)) {
        return; // Already processed, skip
      }

      // Mark as processed
      processedPlayerIdsRef.current.add(payload.playerId);

      // Add player to list
      setPlayers((prevPlayers) => {
        // Double-check for duplicates (safety check)
        const exists = prevPlayers.some((p) => p.id === payload.playerId);
        if (exists) {
          return prevPlayers;
        }
        
        // Add new player
        return [
          ...prevPlayers,
          {
            id: payload.playerId,
            player_name: payload.playerName,
          },
        ];
      });

      // Increment player count when a new player joins
      setPlayerCount((prev) => prev + 1);
    };

    // Subscribe to game channel
    const unsubscribe = subscribeToGameChannel(channel, gameId, {
      onPlayerJoined: handlePlayerJoined,
      onStatusChange: (status) => {
        if (status === "connected") {
          console.log("Realtime connected for player view:", gameId);
        }
      },
      onError: (error) => {
        console.error("Realtime error in player view:", error);
      },
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [gameId, gameStatus]);

  if (gameStatus === "waiting") {
    return (
      <div className="min-h-screen flex flex-col p-4 bg-muted/30">
        {/* Room Code at Top */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground mb-1">Room Code</p>
          <p className="text-2xl font-bold text-primary font-mono">{roomCode}</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start pt-4">
          <div className="text-center space-y-6 max-w-md w-full">
            <div className="space-y-4">
              <h1 className="text-[18px] font-semibold text-foreground">
                Hi, {playerName}!
              </h1>
              <p className="text-[24px] text-foreground font-medium">
                Waiting for host to start...
              </p>
            </div>

            <div className="space-y-4 w-full">
              <p className="text-base text-muted-foreground font-medium">
                {playerCount} {playerCount === 1 ? "player" : "players"} joined
              </p>
              
              {/* Player List with Animations */}
              {players.length > 0 ? (
                <div className="mt-4">
                  <PlayerList players={players} variant="mobile" />
                </div>
              ) : (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-secondary rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameStatus === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
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

