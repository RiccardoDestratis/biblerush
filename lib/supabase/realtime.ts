"use client";

import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  RealtimeEvent,
  RealtimeEventPayload,
  GameChannelCallbacks,
  ConnectionStatus,
  PlayerJoinedPayload,
  PlayerRemovedPayload,
  PlayerRenamedPayload,
  GameStartPayload,
  QuestionAdvancePayload,
  GameEndPayload,
  TimerExpiredPayload,
  GamePausePayload,
  GameResumePayload,
  ScoresUpdatedPayload,
  AnswerRevealPayload,
  LeaderboardReadyPayload,
  AnswerSubmittedPayload,
} from "@/lib/types/realtime";

/**
 * SIMPLE Realtime Channel Manager
 * 
 * One channel per game. All components (host and player) share the same channel.
 * Simple callback registration - no complex wrappers.
 */

// Single client instance for all realtime connections
let realtimeClient: ReturnType<typeof createClient> | null = null;

function getRealtimeClient() {
  if (!realtimeClient) {
    realtimeClient = createClient();
  }
  return realtimeClient;
}

// Global registry: one channel per game
const channels = new Map<string, {
  channel: RealtimeChannel;
  callbacks: Set<GameChannelCallbacks>;
  unsubscribe: () => void;
}>();

/**
 * Subscribe to game events
 * Returns cleanup function to unsubscribe
 */
export function subscribeToGame(
  gameId: string,
  callbacks: GameChannelCallbacks
): () => void {
  // Get or create channel for this game
  let registry = channels.get(gameId);
  
  if (!registry) {
    // Create new channel
    const client = getRealtimeClient();
    const channel = client.channel(`game:${gameId}`);
    
    // Create registry first so callbacks can reference it
    const newRegistry = {
      channel,
      callbacks: new Set<GameChannelCallbacks>(),
      unsubscribe: () => {},
    };
    
    channels.set(gameId, newRegistry);
    
    // Register ALL event listeners ONCE per channel
    channel.on("broadcast", { event: "player_joined" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onPlayerJoined?.(payload.payload as PlayerJoinedPayload));
    });
    
    channel.on("broadcast", { event: "player_removed" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onPlayerRemoved?.(payload.payload as PlayerRemovedPayload));
    });
    
    channel.on("broadcast", { event: "player_renamed" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onPlayerRenamed?.(payload.payload as PlayerRenamedPayload));
    });
    
    channel.on("broadcast", { event: "game_start" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onGameStart?.(payload.payload as GameStartPayload));
    });
    
    channel.on("broadcast", { event: "question_advance" }, (payload) => {
      console.log(`[Realtime] 📨 RECEIVED: question_advance`, payload.payload);
      const callbackCount = newRegistry.callbacks.size;
      console.log(`[Realtime] 📋 Found ${callbackCount} registered callbacks`);
      let callbackIndex = 0;
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => {
        callbackIndex++;
        console.log(`[Realtime] 🔔 Calling onQuestionAdvance callback ${callbackIndex}/${callbackCount}`);
        if (cb.onQuestionAdvance) {
          cb.onQuestionAdvance(payload.payload as QuestionAdvancePayload);
        } else {
          console.log(`[Realtime] ⚠️ Callback ${callbackIndex} has no onQuestionAdvance handler`);
        }
      });
    });
    
    channel.on("broadcast", { event: "game_end" }, (payload) => {
      console.log(`[Realtime] 📨 RECEIVED: game_end`, payload.payload);
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => {
        console.log(`[Realtime] 🔔 Calling onGameEnd callback`);
        cb.onGameEnd?.(payload.payload as GameEndPayload);
      });
    });
    
    channel.on("broadcast", { event: "timer_expired" }, (payload) => {
      console.log(`[Realtime] 📨 RECEIVED: timer_expired`, payload.payload);
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => {
        console.log(`[Realtime] 🔔 Calling onTimerExpired callback`);
        cb.onTimerExpired?.(payload.payload as TimerExpiredPayload);
      });
    });
    
    channel.on("broadcast", { event: "game_pause" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onGamePause?.(payload.payload as GamePausePayload));
    });
    
    channel.on("broadcast", { event: "game_resume" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onGameResume?.(payload.payload as GameResumePayload));
    });
    
    channel.on("broadcast", { event: "scores_updated" }, (payload) => {
      console.log(`[Realtime] 📨 RECEIVED: scores_updated`, payload.payload);
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => {
        console.log(`[Realtime] 🔔 Calling onScoresUpdated callback`);
        cb.onScoresUpdated?.(payload.payload as ScoresUpdatedPayload);
      });
    });
    
    channel.on("broadcast", { event: "answer_reveal" }, (payload) => {
      console.log(`[Realtime] 📨 RECEIVED: answer_reveal`, payload.payload);
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => {
        console.log(`[Realtime] 🔔 Calling onAnswerReveal callback`);
        cb.onAnswerReveal?.(payload.payload as AnswerRevealPayload);
      });
    });
    
    channel.on("broadcast", { event: "leaderboard_ready" }, (payload) => {
      console.log(`[Realtime] 📨 RECEIVED: leaderboard_ready`, payload.payload);
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => {
        console.log(`[Realtime] 🔔 Calling onLeaderboardReady callback`);
        cb.onLeaderboardReady?.(payload.payload as LeaderboardReadyPayload);
      });
    });
    
    channel.on("broadcast", { event: "answer_submitted" }, (payload) => {
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onAnswerSubmitted?.(payload.payload as AnswerSubmittedPayload));
    });
    
    // Subscribe to channel
    channel.subscribe((status) => {
      const connectionStatus: ConnectionStatus = 
        status === "SUBSCRIBED" ? "connected" :
        status === "CHANNEL_ERROR" || status === "TIMED_OUT" ? "reconnecting" :
        status === "CLOSED" ? "disconnected" : "disconnected";
      
      newRegistry.callbacks.forEach((cb: GameChannelCallbacks) => cb.onStatusChange?.(connectionStatus));
    });
    
    // Update unsubscribe function
    newRegistry.unsubscribe = () => {
      channel.unsubscribe();
    };
    registry = newRegistry;
  }
  
  // Add this component's callbacks
  registry.callbacks.add(callbacks);
  
  // Return cleanup function
  return () => {
    const reg = channels.get(gameId);
    if (reg) {
      reg.callbacks.delete(callbacks);
      
      // If no more callbacks, cleanup channel
      if (reg.callbacks.size === 0) {
        reg.unsubscribe();
        reg.channel.unsubscribe();
        channels.delete(gameId);
      }
    }
  };
}

/**
 * Get channel for broadcasting (must already be subscribed)
 */
export function getGameChannel(gameId: string): RealtimeChannel | null {
  return channels.get(gameId)?.channel || null;
}

/**
 * Broadcast an event to all subscribers
 */
export async function broadcastGameEvent(
  gameId: string,
  event: RealtimeEvent,
  payload: RealtimeEventPayload
): Promise<void> {
  const channel = getGameChannel(gameId);
  if (!channel) {
    console.warn(`[Realtime] ⚠️ Cannot broadcast ${event} - channel not found for game ${gameId}`);
    return;
  }
  
  console.log(`[Realtime] 📤 BROADCASTING: ${event}`, payload);
  await channel.send({
    type: "broadcast",
    event,
    payload,
  });
  console.log(`[Realtime] ✅ Broadcast complete: ${event}`);
}
