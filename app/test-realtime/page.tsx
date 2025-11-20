"use client";

import { useState, useEffect } from "react";
import { createGameChannel, subscribeToGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConnectionStatus as ConnectionStatusType } from "@/lib/types/realtime";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function TestRealtimePage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>("disconnected");
  const [gameId, setGameId] = useState<string>("");
  const [channel, setChannel] = useState<ReturnType<typeof createGameChannel> | null>(null);
  const [events, setEvents] = useState<Array<{ time: string; type: string; data: unknown }>>([]);
  const [playerCount, setPlayerCount] = useState(0);

  // Generate a test game ID - try to get an existing game or use placeholder
  useEffect(() => {
    const fetchTestGame = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("games")
        .select("id")
        .limit(1)
        .single();
      
      if (data?.id) {
        setGameId(data.id);
      } else {
        // Placeholder - user can enter a real game ID
        setGameId("");
      }
    };
    
    fetchTestGame();
  }, []);

  const addEvent = (type: string, data: unknown) => {
    setEvents((prev) => [
      {
        time: new Date().toLocaleTimeString(),
        type,
        data: JSON.stringify(data, null, 2),
      },
      ...prev.slice(0, 19), // Keep last 20 events
    ]);
  };

  const handleConnect = () => {
    if (!gameId) {
      toast.error("Please enter a game ID");
      return;
    }

    try {
      const newChannel = createGameChannel(gameId);
      setChannel(newChannel);

      const unsubscribe = subscribeToGameChannel(newChannel, gameId, {
        onPlayerJoined: (payload) => {
          addEvent("player_joined", payload);
          setPlayerCount((prev) => prev + 1);
          toast.success(`Player joined: ${payload.playerName}`);
        },
        onGameStart: (payload) => {
          addEvent("game_start", payload);
          toast.success("Game started!");
        },
        onQuestionAdvance: (payload) => {
          addEvent("question_advance", payload);
          toast.info(`Question advanced to index ${payload.questionIndex}`);
        },
        onGameEnd: (payload) => {
          addEvent("game_end", payload);
          toast.success("Game ended!");
        },
        onStatusChange: (status) => {
          setConnectionStatus(status);
          addEvent("status_change", { status });
          if (status === "connected") {
            toast.success("Connected to Realtime channel");
          } else if (status === "reconnecting") {
            toast.info("Reconnecting...");
          } else if (status === "failed") {
            toast.error("Connection failed");
          }
        },
        onError: (error) => {
          addEvent("error", { message: error.message });
          toast.error(`Realtime error: ${error.message}`);
        },
      });

      // Store unsubscribe function
      (newChannel as any)._unsubscribe = unsubscribe;
    } catch (error) {
      toast.error(`Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`);
      setConnectionStatus("failed");
    }
  };

  const handleDisconnect = () => {
    if (channel) {
      channel.unsubscribe();
      setChannel(null);
      setConnectionStatus("disconnected");
      addEvent("disconnect", { message: "Manually disconnected" });
      toast.info("Disconnected from Realtime channel");
    }
  };

  const handleTestBroadcast = async () => {
    if (!channel) {
      toast.error("Please connect to a channel first");
      return;
    }

    try {
      await broadcastGameEvent(channel, "player_joined", {
        playerId: "test-player-id",
        playerName: "Test Player",
      });
      addEvent("broadcast_sent", { event: "player_joined" });
      toast.success("Broadcast event sent");
    } catch (error) {
      toast.error(`Failed to broadcast: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleTestDatabaseChange = async () => {
    // Test by creating a game player (this will trigger the postgres_changes event)
    const supabase = createClient();
    
    // First, get or create a test game
    let testGameId = gameId;
    if (!testGameId || testGameId === "00000000-0000-0000-0000-000000000000") {
      // Create a test game
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .insert({
          room_code: `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          question_count: 10,
          status: "waiting",
        })
        .select("id")
        .single();

      if (gameError || !gameData) {
        toast.error("Failed to create test game");
        return;
      }

      testGameId = gameData.id;
      setGameId(testGameId);
    }

    // Create a test player (this should trigger the postgres_changes INSERT event)
    const { error: playerError } = await supabase.from("game_players").insert({
      game_id: testGameId,
      player_name: `Test Player ${Date.now()}`,
      total_score: 0,
    });

    if (playerError) {
      toast.error(`Failed to create test player: ${playerError.message}`);
    } else {
      toast.success("Test player created - should trigger database change event");
      addEvent("database_change_test", { action: "insert_player" });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Realtime Test Page</CardTitle>
          <CardDescription>
            Test Supabase Realtime functionality: channels, subscriptions, broadcasts, and database changes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
              <ConnectionStatus status={connectionStatus} />
            </div>
            <div className="text-sm text-muted-foreground">
              Game ID: {gameId || "Not set"}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={handleConnect} disabled={!!channel || !gameId}>
              Connect
            </Button>
            <Button onClick={handleDisconnect} disabled={!channel} variant="destructive">
              Disconnect
            </Button>
            <Button onClick={handleTestBroadcast} disabled={!channel} variant="outline">
              Test Broadcast
            </Button>
            <Button onClick={handleTestDatabaseChange} disabled={!channel} variant="outline">
              Test DB Change
            </Button>
          </div>

          {/* Game ID Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Test Game ID (UUID)</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter game UUID"
              className="w-full px-3 py-2 border rounded-md"
              disabled={!!channel}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use an existing game ID or create a new game first
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Events Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Players Joined</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{playerCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Event Log */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Event Log</h3>
            <div className="border rounded-md p-4 bg-muted/50 max-h-96 overflow-y-auto">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet. Connect and trigger some events.</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <div key={index} className="text-xs font-mono bg-background p-2 rounded border">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-blue-600">{event.type}</span>
                        <span className="text-muted-foreground">{event.time}</span>
                      </div>
                      <pre className="text-xs overflow-x-auto">{String(event.data)}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-sm">Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Enter or generate a game ID</p>
              <p>2. Click "Connect" to subscribe to the Realtime channel</p>
              <p>3. Click "Test Broadcast" to send a custom broadcast event</p>
              <p>4. Click "Test DB Change" to insert a player (triggers postgres_changes event)</p>
              <p>5. Watch the event log for real-time updates</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

