"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { PlayerJoinedPayload } from "@/lib/types/realtime";

/**
 * Join a game by room code
 * @param roomCode - 6-character alphanumeric room code
 * @param playerName - Player display name (2-30 characters)
 * @returns Game ID for redirect or error message
 */
export async function joinGame(
  roomCode: string,
  playerName: string
): Promise<
  | { success: true; gameId: string }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!roomCode || !playerName) {
      return {
        success: false,
        error: "Room code and player name are required",
      };
    }

    // Validate room code format (6 characters, alphanumeric)
    const roomCodeRegex = /^[A-Z0-9]{6}$/;
    if (!roomCodeRegex.test(roomCode)) {
      return {
        success: false,
        error: "Room code must be 6 alphanumeric characters",
      };
    }

    // Validate player name (2-30 characters, trimmed)
    const trimmedName = playerName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      return {
        success: false,
        error: "Player name must be between 2 and 30 characters",
      };
    }

    // Validate player name contains only alphanumeric characters and spaces
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(trimmedName)) {
      return {
        success: false,
        error: "Player name can only contain letters, numbers, and spaces",
      };
    }

    // Find game by room code
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, status")
      .eq("room_code", roomCode.toUpperCase())
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Room code was invalid, please provide the room ID",
      };
    }

    // Check if game is in waiting status
    if (game.status !== "waiting") {
      return {
        success: false,
        error: "This game has already started.",
      };
    }

    // Check technical safety limit (200 players max to prevent overwhelming Supabase connections)
    // Note: Tier-based enforcement (20 for free, unlimited for Pro/Church) will be added in Story 5.3
    // For now, we only enforce a technical safety limit
    const { count: playerCount, error: countError } = await supabase
      .from("game_players")
      .select("*", { count: "exact", head: true })
      .eq("game_id", game.id);

    if (countError) {
      console.error("Error checking player count:", countError);
      return {
        success: false,
        error: "Failed to check player count. Please try again.",
      };
    }

    // Technical safety limit: 200 players max (prevents overwhelming Realtime connections)
    // Tier-based limits (20 for free tier) will be enforced in Story 5.3 with authentication
    if ((playerCount || 0) >= 200) {
      return {
        success: false,
        error: "Game is full (200 players max). Please create a new game.",
      };
    }

    // Insert player into game_players table
    const { data: player, error: playerError } = await supabase
      .from("game_players")
      .insert({
        game_id: game.id,
        player_name: trimmedName,
        total_score: 0,
        joined_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (playerError || !player) {
      console.error("Error joining game:", playerError);
      return {
        success: false,
        error: "Failed to join game. Please try again.",
      };
    }

    // Broadcast player_joined event via Realtime for optimistic UI updates
    // Note: PostgreSQL change listener will also fire automatically as a fallback
    // but broadcast provides immediate feedback (<500ms latency target)
    try {
      // Use service role client to broadcast events from server
      const serviceClient = createServiceClient();
      const channel = serviceClient.channel(`game:${game.id}`);
      
      // Subscribe to the channel first (required before broadcasting)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Channel subscription timeout"));
        }, 3000);

        channel.subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            reject(new Error(`Failed to subscribe to channel: ${status}`));
          }
        });
      });
      
      const payload: PlayerJoinedPayload = {
        playerId: player.id,
        playerName: trimmedName,
      };
      
      // Broadcast the event
      await channel.send({
        type: "broadcast",
        event: "player_joined",
        payload,
      });
      
      // Clean up the channel after broadcasting
      // Use setTimeout to ensure broadcast is sent before unsubscribing
      setTimeout(() => {
        channel.unsubscribe();
      }, 200);
    } catch (broadcastError) {
      // Log error but don't fail the join - player is already in database
      // PostgreSQL change listener will still fire and update clients automatically
      console.error("Error broadcasting player_joined event:", broadcastError);
      // This is non-fatal - the PostgreSQL change listener will handle the update
    }

    // Revalidate paths
    revalidatePath(`/game/${game.id}/play`);
    revalidatePath(`/game/${game.id}/host`);

    return {
      success: true,
      gameId: game.id,
    };
  } catch (error) {
    console.error("Unexpected error joining game:", error);
    return {
      success: false,
      error: "Connection failed. Try again.",
    };
  }
}

/**
 * Get player count for a game
 * @param gameId - UUID of the game
 * @returns Player count or error
 */
export async function getPlayerCount(
  gameId: string
): Promise<
  | { success: true; count: number }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("game_players")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId);

    if (error) {
      console.error("Error fetching player count:", error);
      return {
        success: false,
        error: "Failed to fetch player count",
      };
    }

    return {
      success: true,
      count: count || 0,
    };
  } catch (error) {
    console.error("Unexpected error fetching player count:", error);
    return {
      success: false,
      error: "Failed to fetch player count",
    };
  }
}

/**
 * Get players for a game
 * @param gameId - UUID of the game
 * @returns List of players or error
 */
export async function getPlayers(
  gameId: string
): Promise<
  | { success: true; players: Array<{ id: string; player_name: string; joined_at: string }> }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("game_players")
      .select("id, player_name, joined_at")
      .eq("game_id", gameId)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Error fetching players:", error);
      return {
        success: false,
        error: "Failed to fetch players",
      };
    }

    // Map players to ensure joined_at is always a string (never null)
    const players = (data || []).map((player) => ({
      id: player.id,
      player_name: player.player_name,
      joined_at: player.joined_at || new Date().toISOString(),
    }));

    return {
      success: true,
      players,
    };
  } catch (error) {
    console.error("Unexpected error fetching players:", error);
    return {
      success: false,
      error: "Failed to fetch players",
    };
  }
}

