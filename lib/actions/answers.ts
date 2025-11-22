"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: Submit player answer
 * Validates inputs, checks for duplicates, and inserts answer into database
 * 
 * @param gameId - UUID of the game
 * @param playerId - UUID of the player (from game_players table)
 * @param questionId - UUID of the question
 * @param selectedAnswer - Selected answer: 'A', 'B', 'C', 'D', or null
 * @param responseTimeMs - Response time in milliseconds (0-15000)
 * @returns Success or error response
 */
export async function submitAnswer(
  gameId: string,
  playerId: string,
  questionId: string,
  selectedAnswer: "A" | "B" | "C" | "D" | null,
  responseTimeMs: number
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId || !playerId || !questionId) {
      return {
        success: false,
        error: "Game ID, Player ID, and Question ID are required",
      };
    }

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId) || !uuidRegex.test(playerId) || !uuidRegex.test(questionId)) {
      return {
        success: false,
        error: "Invalid UUID format for game, player, or question ID",
      };
    }

    // Validate selectedAnswer
    if (selectedAnswer !== null && !["A", "B", "C", "D"].includes(selectedAnswer)) {
      return {
        success: false,
        error: "Selected answer must be 'A', 'B', 'C', 'D', or null",
      };
    }

    // Validate responseTimeMs
    if (responseTimeMs < 0 || responseTimeMs > 15000) {
      return {
        success: false,
        error: "Response time must be between 0 and 15000 milliseconds",
      };
    }

    // Check for duplicate submission
    const { data: existingAnswer, error: checkError } = await supabase
      .from("player_answers")
      .select("id")
      .eq("player_id", playerId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows found" - that's fine, means no duplicate
      return {
        success: false,
        error: "Failed to check for existing answer",
      };
    }

    if (existingAnswer) {
      return {
        success: false,
        error: "Answer already submitted",
      };
    }

    // Verify game exists and is active
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, status")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    if (game.status !== "active") {
      return {
        success: false,
        error: "Game is not active",
      };
    }

    // Verify question exists and belongs to game's question set
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, question_set_id")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    // Verify player belongs to game
    const { data: player, error: playerError } = await supabase
      .from("game_players")
      .select("id, game_id")
      .eq("id", playerId)
      .eq("game_id", gameId)
      .single();

    if (playerError || !player) {
      return {
        success: false,
        error: "Player not found in game",
      };
    }

    // Insert answer into database
    const { error: insertError } = await supabase.from("player_answers").insert({
      game_id: gameId,
      player_id: playerId,
      question_id: questionId,
      selected_answer: selectedAnswer,
      response_time_ms: responseTimeMs,
      is_correct: null, // Calculated later in Story 3.1
      points_earned: null, // Calculated later in Story 3.1
      answered_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Error inserting answer:", insertError);
      return {
        success: false,
        error: "Failed to submit answer. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error in submitAnswer:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

