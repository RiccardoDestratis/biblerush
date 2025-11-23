"use client";

import { advanceQuestion } from "@/lib/actions/games";
import { processQuestionScores } from "@/lib/actions/answers";
import { getGameChannel, broadcastGameEvent } from "@/lib/supabase/realtime";
import type { QuestionAdvancePayload, GameEndPayload } from "@/lib/types/realtime";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Client-side helper to advance question and broadcast event
 * Called by Story 3.4 (Leaderboard) after countdown completes
 * 
 * @param gameId - UUID of the game
 * @param channel - Realtime channel for broadcasting (optional, will create if not provided)
 * @returns Success/error result
 */
export async function advanceQuestionAndBroadcast(
  gameId: string
): Promise<{ success: true; gameEnded: boolean; questionData?: QuestionAdvancePayload } | { success: false; error: string }> {
  try {
    // Before advancing, process scores for the current question
    // Get current question ID from game state
    const supabase = createClient();
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("current_question_index, question_set_id, question_count")
      .eq("id", gameId)
      .single();

    if (!gameError && game) {
      const currentQuestionIndex = game.current_question_index ?? 0;
      
      // Only process scores if we're not at the start (currentQuestionIndex >= 0 means we've started)
      // and we haven't completed all questions
      if (
        currentQuestionIndex >= 0 &&
        currentQuestionIndex < game.question_count &&
        game.question_set_id
      ) {
        // Fetch current question ID using question_set_id and order_index (1-based)
        const orderIndex = currentQuestionIndex + 1;
        const { data: question, error: questionError } = await supabase
          .from("questions")
          .select("id")
          .eq("question_set_id", game.question_set_id)
          .eq("order_index", orderIndex)
          .single();

        if (!questionError && question) {
          // Process scores for current question before advancing
          const scoreResult = await processQuestionScores(gameId, question.id);
          
          if (!scoreResult.success) {
            // Log error but don't block advancement - scores can be recalculated if needed
            console.error("Error processing scores:", scoreResult.error);
            // Continue with advancement even if scoring fails
            // Note: Scores will be recalculated when leaderboard is displayed
          }
        }
      }
    }

    // Call Server Action to advance question
    console.log(`[QuestionAdvance] 📞 Calling server action: advanceQuestion(${gameId})`);
    const result = await advanceQuestion(gameId);

    if (!result.success) {
      console.error(`[QuestionAdvance] ❌ Server action failed:`, result.error);
      return {
        success: false,
        error: result.error,
      };
    }

    // If game ended, broadcast game_end event AND update store locally (local echo)
    if (result.gameEnded) {
      console.log(`[QuestionAdvance] 🏁 Game ended, updating store and broadcasting game_end`);
      const payload: GameEndPayload = {
        completedAt: result.completedAt,
      };
      
      // CRITICAL: Update store immediately (local echo) - same pattern as question_advance
      // This ensures final results show immediately on the broadcaster
      const { useGameStore } = await import("@/lib/store/game-store");
      const store = useGameStore.getState();
      console.log(`[QuestionAdvance] 📝 Updating store immediately (local echo): gameStatus = "ended", revealState = "results"`);
      store.setGameStatus("ended");
      store.setRevealState("results");
      console.log(`[QuestionAdvance] ✅ Store updated, FinalResultsProjector should render now`);
      
      // Broadcast event (other clients will update via onGameEnd handler)
      await broadcastGameEvent(gameId, "game_end", payload);
      console.log(`[QuestionAdvance] ✅ game_end event broadcast complete`);
      
      return {
        success: true,
        gameEnded: true,
      };
    }

    // Game continues - broadcast question_advance event
    console.log(`[QuestionAdvance] ➡️ Advancing to question ${result.questionData.questionNumber}, broadcasting question_advance`);
    const payload: QuestionAdvancePayload = result.questionData;
    await broadcastGameEvent(gameId, "question_advance", payload);

    return {
      success: true,
      gameEnded: false,
      questionData: payload
    };
  } catch (error) {
    console.error("Error advancing question:", error);
    return {
      success: false,
      error: "Failed to advance question. Please try again.",
    };
  }
}

