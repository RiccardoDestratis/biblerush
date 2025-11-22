"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createGameChannel, subscribeToGameChannel } from "@/lib/supabase/realtime";
import type { PlayerJoinedPayload, PlayerRemovedPayload, PlayerRenamedPayload, GameStartPayload } from "@/lib/types/realtime";
import { useGameStore } from "@/lib/store/game-store";
import { getPlayerCount, getPlayers, removePlayer, renamePlayer } from "@/lib/actions/players";
import { PlayerList } from "@/components/game/player-list";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface PlayerWaitingViewProps {
  gameId: string;
  playerId: string;
  gameStatus: string;
  playerName: string;
  playerCount: number;
  roomCode: string;
}

export function PlayerWaitingView({
  gameId,
  playerId,
  gameStatus,
  playerName: initialPlayerName,
  playerCount: initialPlayerCount,
  roomCode,
}: PlayerWaitingViewProps) {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [playerName, setPlayerName] = useState(initialPlayerName);
  const [players, setPlayers] = useState<Array<{ id: string; player_name: string }>>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isGameStarting, setIsGameStarting] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const processedPlayerIdsRef = useRef<Set<string>>(new Set());
  const removalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRemovedRef = useRef(false);
  const { startGame: startGameStore, setGameStatus } = useGameStore();

  // Cookie key for storing player info for restoration
  const COOKIE_KEY = useRef(`player_${gameId}`).current;
  const RESTORATION_WINDOW_MS = 5000; // 5 seconds

  // Store player info in cookie for restoration (updated when player is active)
  useEffect(() => {
    if (gameStatus !== "waiting") return;
    
    // Update cookie periodically to show player is active
    const interval = setInterval(() => {
      const cookieData = {
        playerId,
        playerName,
        lastActive: Date.now(),
      };
      document.cookie = `${COOKIE_KEY}=${JSON.stringify(cookieData)}; path=/; max-age=10`; // 10 second expiry
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [gameId, playerId, playerName, gameStatus, COOKIE_KEY]);

  // Handle navigation away - remove player after delay
  useEffect(() => {
    if (gameStatus !== "waiting" || hasRemovedRef.current) return;

    const handleBeforeUnload = () => {
      // Set cookie with removal timestamp
      const cookieData = {
        playerId,
        playerName,
        leftAt: Date.now(),
      };
      document.cookie = `${COOKIE_KEY}=${JSON.stringify(cookieData)}; path=/; max-age=10`;
      
      // Try to remove immediately (may not complete if page unloads)
      removePlayer(gameId, playerId).catch(() => {
        // Ignore errors - cleanup will happen via cookie check
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden - schedule removal after delay
        if (removalTimeoutRef.current) {
          clearTimeout(removalTimeoutRef.current);
        }
        removalTimeoutRef.current = setTimeout(async () => {
          if (!document.hidden || hasRemovedRef.current) return; // User came back or already removed
          hasRemovedRef.current = true;
          const result = await removePlayer(gameId, playerId);
          if (result.success) {
            // Clear cookie on successful removal
            document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
          }
        }, RESTORATION_WINDOW_MS);
      } else {
        // Page is visible again - cancel removal
        if (removalTimeoutRef.current) {
          clearTimeout(removalTimeoutRef.current);
          removalTimeoutRef.current = null;
        }
        // Update cookie to show player is active again
        const cookieData = {
          playerId,
          playerName,
          lastActive: Date.now(),
        };
        document.cookie = `${COOKIE_KEY}=${JSON.stringify(cookieData)}; path=/; max-age=10`;
      }
    };

    const handlePageHide = () => {
      // Page is being unloaded - try immediate removal (may not complete)
      if (!hasRemovedRef.current) {
        removePlayer(gameId, playerId).catch(() => {
          // Ignore errors - cleanup will happen via visibility change if page stays hidden
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("pagehide", handlePageHide);
      if (removalTimeoutRef.current) {
        clearTimeout(removalTimeoutRef.current);
      }
    };
  }, [gameId, playerId, playerName, gameStatus, COOKIE_KEY, RESTORATION_WINDOW_MS]);

  // Check for restoration on mount
  useEffect(() => {
    if (gameStatus !== "waiting") return;

    const cookies = document.cookie.split(";");
    const cookie = cookies.find((c) => c.trim().startsWith(`${COOKIE_KEY}=`));
    
    if (cookie) {
      try {
        const data = JSON.parse(cookie.split("=")[1]);
        const timeSinceLeft = Date.now() - data.leftAt;
        
        if (timeSinceLeft < RESTORATION_WINDOW_MS && data.playerId === playerId) {
          // User returned within window - clear cookie, they're already in the game
          document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
        }
      } catch (e) {
        // Invalid cookie, ignore
      }
    }
  }, [gameId, playerId, gameStatus, COOKIE_KEY, RESTORATION_WINDOW_MS]);

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

    // Handle player removed event
    const handlePlayerRemoved = (payload: PlayerRemovedPayload) => {
      // Remove player from list
      setPlayers((prevPlayers) => prevPlayers.filter((p) => p.id !== payload.playerId));
      
      // Decrement player count
      setPlayerCount((prev) => Math.max(0, prev - 1));
      
      // If this is the current player, they were removed by host
      if (payload.playerId === playerId) {
        // Redirect to join page
        window.location.href = `/join?code=${roomCode}`;
      }
    };

    // Handle player renamed event
    const handlePlayerRenamed = (payload: PlayerRenamedPayload) => {
      // Update player in list
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === payload.playerId ? { ...p, player_name: payload.newName } : p
        )
      );

      // If this is the current player, update their name and show notification
      if (payload.playerId === playerId) {
        setPlayerName(payload.newName);
        setIsRenaming(false);
        setRenameValue("");
        // Update URL to include playerId for persistence after rename
        router.replace(`/game/${gameId}/play?playerId=${playerId}&playerName=${encodeURIComponent(payload.newName)}`, { scroll: false });
        toast.info(`You have been renamed to "${payload.newName}"`, {
          duration: 4000,
        });
      }
    };

    // Handle game_start event
    const handleGameStart = (payload: GameStartPayload) => {
      setIsGameStarting(true);
      
      // Update Zustand store with question data
      // totalQuestions is now included in the payload from the Server Action
      startGameStore(payload, payload.totalQuestions);
      setGameStatus("active");
      
      // Show loading state
      toast.loading("Starting game...", { id: "game-start" });
      
      // TODO: Navigate to question display view (Story 2.5)
      // For now, we'll just show a loading state
    };

    // Subscribe to game channel
    const unsubscribe = subscribeToGameChannel(channel, gameId, {
      onPlayerJoined: handlePlayerJoined,
      onPlayerRemoved: handlePlayerRemoved,
      onPlayerRenamed: handlePlayerRenamed,
      onGameStart: handleGameStart,
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

  const handleStartRename = () => {
    setIsRenaming(true);
    setRenameValue(playerName);
  };

  const handleSaveRename = async () => {
    if (!renameValue.trim()) {
      toast.error("Player name cannot be empty");
      return;
    }

    const result = await renamePlayer(gameId, playerId, renameValue.trim());
    if (result.success) {
      // The realtime event will handle the update and notification
      setIsRenaming(false);
    } else {
      toast.error(result.error || "Failed to rename");
    }
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setRenameValue("");
  };

  if (isGameStarting || gameStatus === "active") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-[24px] font-semibold text-foreground">
              Starting game...
            </h1>
          </div>
          <p className="text-base text-muted-foreground">
            Loading first question...
          </p>
        </div>
      </div>
    );
  }

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
              {isRenaming ? (
                <div className="flex flex-col items-center gap-3">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveRename();
                      } else if (e.key === "Escape") {
                        handleCancelRename();
                      }
                    }}
                    className="px-4 py-2 border rounded-lg bg-background text-center text-[18px] font-semibold w-full max-w-xs"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveRename}
                      variant="default"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCancelRename}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-[18px] font-semibold text-foreground">
                    Hi, {playerName}!
                  </h1>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={handleStartRename}
                    title="Rename yourself"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
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

