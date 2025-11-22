"use client";

import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  RealtimeEvent,
  RealtimeEventPayload,
  GameChannelCallbacks,
  ConnectionStatus,
} from "@/lib/types/realtime";
import { toast } from "sonner";

/**
 * Realtime helper utility for game channels
 * Manages Supabase Realtime channel subscriptions with reconnection logic
 */

/**
 * Creates a Realtime channel for a specific game
 * Channel naming convention: `game:${gameId}` for per-game isolation
 *
 * @param gameId - The game ID to create a channel for
 * @returns A Supabase Realtime channel instance
 */
export function createGameChannel(gameId: string): RealtimeChannel {
  const supabase = createClient();
  const channelName = `game:${gameId}`;
  return supabase.channel(channelName);
}

/**
 * Subscribes to a game channel with event handlers
 * Uses Supabase's built-in reconnection - no manual reconnection needed
 *
 * @param channel - The Realtime channel to subscribe to
 * @param gameId - The game ID (used for postgres_changes filters)
 * @param callbacks - Event handlers for different events
 * @returns A cleanup function to unsubscribe
 */
export function subscribeToGameChannel(
  channel: RealtimeChannel,
  gameId: string,
  callbacks: GameChannelCallbacks
): () => void {
  let wasConnected = false; // Track if we've ever been successfully connected
  let errorToastShown = false;

  // IMPORTANT: All listeners must be added BEFORE calling subscribe()
  // Subscribe to broadcast events
  channel.on("broadcast", { event: "player_joined" }, (payload) => {
    callbacks.onPlayerJoined?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "player_removed" }, (payload) => {
    callbacks.onPlayerRemoved?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "player_renamed" }, (payload) => {
    callbacks.onPlayerRenamed?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "game_start" }, (payload) => {
    callbacks.onGameStart?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "question_advance" }, (payload) => {
    callbacks.onQuestionAdvance?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "game_end" }, (payload) => {
    callbacks.onGameEnd?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "timer_expired" }, (payload) => {
    callbacks.onTimerExpired?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "game_pause" }, (payload) => {
    callbacks.onGamePause?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "game_resume" }, (payload) => {
    callbacks.onGameResume?.(payload.payload as any);
  });

  channel.on("broadcast", { event: "scores_updated" }, (payload) => {
    callbacks.onScoresUpdated?.(payload.payload as any);
  });

  // Subscribe to PostgreSQL changes - MUST be before subscribe()
  // Listen to INSERT on game_players table
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "game_players",
      filter: `game_id=eq.${gameId}`,
    },
    (payload) => {
      // Trigger player_joined callback if available
      if (payload.new && callbacks.onPlayerJoined) {
        callbacks.onPlayerJoined({
          playerId: payload.new.id,
          playerName: payload.new.player_name,
        });
      }
    }
  );

  // Listen to UPDATE on games table
  channel.on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "games",
      filter: `id=eq.${gameId}`,
    },
    (payload) => {
      const oldRecord = payload.old;
      const newRecord = payload.new;

      // Track status changes
      if (oldRecord?.status !== newRecord?.status) {
        if (newRecord.status === "active" && callbacks.onGameStart) {
          // Note: This is a fallback for PostgreSQL change tracking
          // The actual game_start event with full payload is broadcast client-side
          // This callback should not be used for game start - it's just for status tracking
          // The proper game_start event comes from the broadcast event handler above
        } else if (newRecord.status === "completed" && callbacks.onGameEnd) {
          callbacks.onGameEnd({
            completedAt: new Date().toISOString(),
          });
        }
      }

      // Track current_question_index changes (question advancement)
      if (oldRecord?.current_question_index !== newRecord?.current_question_index) {
        // Note: questionData would need to be fetched separately or included in the update
        // For now, we'll trigger the callback with minimal data
        if (callbacks.onQuestionAdvance) {
          // Note: questionData will be fetched by client via Server Action
          // This event just notifies that question index changed
          callbacks.onQuestionAdvance({
            questionIndex: newRecord.current_question_index || 0,
            questionNumber: (newRecord.current_question_index || 0) + 1,
            questionId: "",
            questionText: "",
            options: [],
            correctAnswer: "",
            timerDuration: 15,
            startedAt: new Date().toISOString(),
            totalQuestions: newRecord.question_count || 0,
          });
        }
      }
    }
  );

  // NOW subscribe - this must be the last call
  // Supabase handles reconnection automatically - we just map status to our UI
  channel.subscribe((status) => {
    // Map Supabase Realtime status to our ConnectionStatus type
    let connectionStatus: ConnectionStatus;
    
    if (status === "SUBSCRIBED") {
      connectionStatus = "connected";
      wasConnected = true;
      errorToastShown = false;
      callbacks.onStatusChange?.(connectionStatus);
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      // Supabase automatically handles reconnection - we just show status
      if (wasConnected) {
        connectionStatus = "reconnecting";
        if (!errorToastShown) {
          toast.error("Connection lost. Reconnecting...");
          errorToastShown = true;
        }
      } else {
        // Initial connection failed
        connectionStatus = "failed";
        if (!errorToastShown) {
          callbacks.onError?.(new Error(`Failed to connect to Realtime channel: ${status}`));
          errorToastShown = true;
        }
      }
      callbacks.onStatusChange?.(connectionStatus);
    } else if (status === "CLOSED") {
      connectionStatus = "disconnected";
      wasConnected = false;
      errorToastShown = false;
      callbacks.onStatusChange?.(connectionStatus);
    } else {
      // For other statuses (JOINED, LEFT, etc.), don't change status
      // JOINED is an intermediate state before SUBSCRIBED - wait for SUBSCRIBED
      return;
    }
  });

  // Return cleanup function
  return () => {
    channel.unsubscribe();
  };
}

/**
 * Broadcasts an event to all subscribers of a game channel
 *
 * @param channel - The Realtime channel to broadcast on
 * @param event - The event name to broadcast
 * @param payload - The event payload
 * @returns Promise that resolves when broadcast is sent
 */
export async function broadcastGameEvent(
  channel: RealtimeChannel,
  event: RealtimeEvent,
  payload: RealtimeEventPayload
): Promise<void> {
  await channel.send({
    type: "broadcast",
    event,
    payload,
  });
}

/**
 * Gets the connection status from a channel
 *
 * @param channel - The Realtime channel
 * @returns The current connection status
 */
export function getConnectionStatus(channel: RealtimeChannel): ConnectionStatus {
  // Note: Supabase Realtime doesn't expose connection status directly
  // This is a helper that can be used with status callbacks
  // The actual status should be tracked via onStatusChange callback
  return "disconnected";
}

