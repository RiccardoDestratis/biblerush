"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { cancelGame } from "@/lib/actions/games";
import { getPlayerCount, getPlayers, removePlayer, renamePlayer } from "@/lib/actions/players";
import { PlayerList } from "@/components/game/player-list";
import { createGameChannel, subscribeToGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { PlayerJoinedPayload, PlayerRemovedPayload, PlayerRenamedPayload, GameStartPayload } from "@/lib/types/realtime";
import { startGame } from "@/lib/actions/games";
import { getQuestions } from "@/lib/actions/questions";
import { useGameStore } from "@/lib/store/game-store";
import { toast } from "sonner";
import { Loader2, X, MoreVertical, Trash2, Edit2 } from "lucide-react";

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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [renamingPlayerId, setRenamingPlayerId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isGameStarting, setIsGameStarting] = useState(false);
  const channelRef = useRef<ReturnType<typeof createGameChannel> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const processedPlayerIdsRef = useRef<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  const { startGame: startGameStore, setGameStatus, addPreloadedQuestion } = useGameStore();

  // Fetch initial players from database
  const fetchPlayers = useCallback(async () => {
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
  }, [gameId]);

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
  }, [roomCode, gameId, fetchPlayers]);

  // Set up real-time subscription for player joins
  useEffect(() => {
    // Create game channel
    const channel = createGameChannel(gameId);
    channelRef.current = channel;

    // Reset processed IDs when game changes
    processedPlayerIdsRef.current = new Set();

    // Handle player joined event (optimistic update)
    const handlePlayerJoined = (payload: PlayerJoinedPayload) => {
      // Check if we've already processed this player (avoid duplicates from broadcast + DB event)
      if (processedPlayerIdsRef.current.has(payload.playerId)) {
        return; // Already processed, skip
      }

      // Mark as processed
      processedPlayerIdsRef.current.add(payload.playerId);

      // Optimistic update: Add player immediately
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
      
      // Update count
      setPlayerCount((prev) => prev + 1);
    };

    // Handle player removed event
    const handlePlayerRemoved = (payload: PlayerRemovedPayload) => {
      setPlayers((prevPlayers) => prevPlayers.filter((p) => p.id !== payload.playerId));
      setPlayerCount((prev) => Math.max(0, prev - 1));
      if (selectedPlayerId === payload.playerId) {
        setSelectedPlayerId(null);
      }
    };

    // Handle player renamed event
    const handlePlayerRenamed = (payload: PlayerRenamedPayload) => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((p) =>
          p.id === payload.playerId ? { ...p, player_name: payload.newName } : p
        )
      );
      if (renamingPlayerId === payload.playerId) {
        setRenamingPlayerId(null);
        setRenameValue("");
      }
    };

    // Handle game_start event
    const handleGameStart = (payload: GameStartPayload) => {
      setIsGameStarting(true);
      
      // Update Zustand store with question data
      // totalQuestions is now included in the payload from the Server Action
      startGameStore(payload, payload.totalQuestions);
      setGameStatus("active");
      
      // Transition to question display (for now, just show a message)
      // In Story 2.4, this will transition to actual question display
      toast.success("Game started!");
      
      // TODO: Navigate to question display view (Story 2.4)
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
          console.log("Realtime connected for game:", gameId);
        } else if (status === "reconnecting") {
          console.log("Realtime reconnecting...");
        } else if (status === "failed") {
          console.error("Realtime connection failed");
        }
      },
      onError: (error) => {
        console.error("Realtime error:", error);
      },
    });

    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [gameId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedPlayerId(null);
        setMenuPosition(null);
      }
    };

    if (selectedPlayerId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [selectedPlayerId]);

  // Update menu position on scroll
  useEffect(() => {
    if (!selectedPlayerId || !menuPosition) return;

    const updatePosition = () => {
      const button = document.querySelector(`[data-player-button="${selectedPlayerId}"]`) as HTMLElement;
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        setMenuPosition({
          top: buttonRect.bottom + 4,
          right: window.innerWidth - buttonRect.right,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [selectedPlayerId, menuPosition]);

  const handlePlayerClick = (playerId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedPlayerId === playerId) {
      setSelectedPlayerId(null);
      setMenuPosition(null);
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: buttonRect.bottom + 4,
        right: window.innerWidth - buttonRect.right,
      });
      setSelectedPlayerId(playerId);
      setRenamingPlayerId(null);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    const result = await removePlayer(gameId, playerId);
    if (result.success) {
      toast.success("Player removed");
      setSelectedPlayerId(null);
      setMenuPosition(null);
    } else {
      toast.error(result.error || "Failed to remove player");
    }
  };

  const handleStartRename = (playerId: string, currentName: string) => {
    setRenamingPlayerId(playerId);
    setRenameValue(currentName);
    setSelectedPlayerId(null);
  };

  const handleSaveRename = async (playerId: string) => {
    if (!renameValue.trim()) {
      toast.error("Player name cannot be empty");
      return;
    }

    const result = await renamePlayer(gameId, playerId, renameValue.trim());
    if (result.success) {
      toast.success("Player renamed");
      setRenamingPlayerId(null);
      setRenameValue("");
    } else {
      toast.error(result.error || "Failed to rename player");
    }
  };

  const handleCancelRename = () => {
    setRenamingPlayerId(null);
    setRenameValue("");
  };

  const handleStartGame = async () => {
    if (playerCount === 0) {
      toast.error("At least 1 player must join before starting the game");
      return;
    }

    setIsStartingGame(true);

    try {
      // Call Server Action to start game
      const result = await startGame(gameId);

      if (!result.success) {
        toast.error(result.error || "Failed to start game. Please try again.");
        setIsStartingGame(false);
        return;
      }

      // Show loading state
      setIsGameStarting(true);
      toast.loading("Starting game...", { id: "game-start" });

      // Broadcast game_start event to all subscribers
      const channel = channelRef.current;
      if (channel) {
        await broadcastGameEvent(channel, "game_start", result.questionData);
      }

      // Update Zustand store
      // totalQuestions is now included in the payload from the Server Action
      startGameStore(result.questionData, result.questionData.totalQuestions);
      setGameStatus("active");

      // Pre-load next 3 questions in background (non-blocking)
      if (result.questionData.questionSetId) {
        getQuestions(result.questionData.questionSetId, 2, 3)
          .then((preloadResult) => {
            if (preloadResult.success && preloadResult.questions.length > 0) {
              // Store pre-loaded questions in Zustand store
              preloadResult.questions.forEach((q) => {
                addPreloadedQuestion(q);
              });
              console.log(`Pre-loaded ${preloadResult.questions.length} questions`);
            }
          })
          .catch((error) => {
            // Non-blocking - errors are logged but don't affect game start
            console.warn("Failed to pre-load questions:", error);
          });
      }

      // Dismiss loading toast
      toast.dismiss("game-start");
      toast.success("Game started!");

      // TODO: Navigate to question display view (Story 2.4)
      // For now, we'll just show a loading state
    } catch (error) {
      console.error("Error starting game:", error);
      toast.error("An unexpected error occurred. Please try again.");
      setIsStartingGame(false);
      setIsGameStarting(false);
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
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center">
            {playerCount} {playerCount === 1 ? "Player" : "Players"} Joined
          </h2>
          
          {/* Menu Portal - Fixed Position */}
          {selectedPlayerId && menuPosition && (
            <div
              ref={menuRef}
              className="fixed bg-background border rounded-lg shadow-xl z-[9999] min-w-[120px]"
              style={{
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`,
              }}
            >
              <button
                className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-sm rounded-t-lg"
                onClick={() => {
                  const player = players.find((p) => p.id === selectedPlayerId);
                  if (player) handleStartRename(selectedPlayerId, player.player_name);
                }}
              >
                <Edit2 className="h-4 w-4" />
                Rename
              </button>
              <button
                className="w-full px-4 py-2 text-left hover:bg-destructive/10 text-destructive flex items-center gap-2 text-sm rounded-b-lg"
                onClick={() => handleRemovePlayer(selectedPlayerId)}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          )}
          
          {/* Player List with Click Actions */}
          <div className="relative">
            {players.length === 0 ? (
              <p className="text-xl text-muted-foreground text-center">
                Players will appear here when they join...
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="bg-background/50 backdrop-blur-sm rounded-lg p-4 text-left border border-primary/20 flex items-center justify-between group relative"
                  >
                    {renamingPlayerId === player.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveRename(player.id);
                            } else if (e.key === "Escape") {
                              handleCancelRename();
                            }
                          }}
                          className="flex-1 px-3 py-1 border rounded bg-background"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveRename(player.id)}
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
                    ) : (
                      <>
                        <p className="text-xl font-medium text-foreground flex-1">
                          {index + 1}. {player.player_name}
                        </p>
                        <div className="relative flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            onClick={(e) => handlePlayerClick(player.id, e)}
                            data-player-button={player.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="mt-12">
          {isGameStarting ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-2xl font-semibold text-foreground">
                  Starting game...
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Loading first question...
              </p>
            </div>
          ) : (
            <>
              <Button
                size="lg"
                disabled={playerCount === 0 || isStartingGame}
                onClick={handleStartGame}
                className="min-w-[300px] h-16 text-xl"
              >
                {isStartingGame ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  "Start Game"
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                {playerCount === 0
                  ? "(Will be enabled when players join)"
                  : `Ready to start with ${playerCount} ${playerCount === 1 ? "player" : "players"}`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

