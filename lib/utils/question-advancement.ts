"use client";

import { advanceQuestion } from "@/lib/actions/games";
import { createGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { QuestionAdvancePayload, GameEndPayload } from "@/lib/types/realtime";
import { toast } from "sonner";

/**
 * Client-side helper to advance question and broadcast event
 * Called by Story 3.4 (Leaderboard) after countdown completes
 * 
 * @param gameId - UUID of the game
 * @param channel - Realtime channel for broadcasting (optional, will create if not provided)
 * @returns Success/error result
 */
export async function advanceQuestionAndBroadcast(
  gameId: string,
  channel?: ReturnType<typeof createGameChannel>
): Promise<{ success: true; gameEnded: boolean } | { success: false; error: string }> {
  try {
    // Call Server Action to advance question
    const result = await advanceQuestion(gameId);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // If game ended, broadcast game_end event
    if (result.gameEnded) {
      const channelToUse = channel || createGameChannel(gameId);
      if (!channel) {
        // Subscribe to channel if we created it
        channelToUse.subscribe();
      }

      const payload: GameEndPayload = {
        completedAt: result.completedAt,
      };

      await broadcastGameEvent(channelToUse, "game_end", payload);

      return {
        success: true,
        gameEnded: true,
      };
    }

    // Game continues - broadcast question_advance event
    const channelToUse = channel || createGameChannel(gameId);
    if (!channel) {
      // Subscribe to channel if we created it
      channelToUse.subscribe();
    }

    const payload: QuestionAdvancePayload = result.questionData;

    await broadcastGameEvent(channelToUse, "question_advance", payload);

    return {
      success: true,
      gameEnded: false,
    };
  } catch (error) {
    console.error("Error advancing question:", error);
    return {
      success: false,
      error: "Failed to advance question. Please try again.",
    };
  }
}

