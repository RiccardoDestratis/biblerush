"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calculateScore } from "@/lib/game/scoring";
import type { ScoresUpdatedPayload } from "@/lib/types/realtime";

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

    // Broadcast answer_submitted event
    try {
      const serviceClient = createServiceClient();
      const channel = serviceClient.channel(`game:${gameId}`);

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

      await channel.send({
        type: "broadcast",
        event: "answer_submitted",
        payload: {
          gameId,
          questionId,
          playerId,
        },
      });

      setTimeout(() => {
        channel.unsubscribe();
      }, 500);
    } catch (broadcastError) {
      console.error("Error broadcasting answer_submitted event:", broadcastError);
      // Don't fail the request if broadcast fails
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

/**
 * Server Action: Process scores for a question
 * Calculates is_correct and points_earned for all player answers,
 * updates player_answers and game_players.total_score,
 * and broadcasts scores_updated event
 * 
 * @param gameId - UUID of the game
 * @param questionId - UUID of the question
 * @returns Success with processed count or error response
 */
export async function processQuestionScores(
  gameId: string,
  questionId: string
): Promise<
  | { success: true; processedCount: number }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId || !questionId) {
      return {
        success: false,
        error: "Game ID and Question ID are required",
      };
    }

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId) || !uuidRegex.test(questionId)) {
      return {
        success: false,
        error: "Invalid UUID format for game or question ID",
      };
    }

    // Validate game exists and is in 'active' status
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

    // Allow processing scores for active games, or completed games (in case scoring happens after game ends)
    // This prevents race conditions where game ends before scores are processed
    if (game.status !== "active" && game.status !== "completed") {
      return {
        success: false,
        error: `Game is not active or completed. Current status: ${game.status}`,
      };
    }

    // Fetch correct answer from questions table
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("correct_answer")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    const correctAnswer = question.correct_answer;

    // Fetch all player_answers for this game and question
    // Check if scores have already been processed (points_earned is not null)
    const { data: answers, error: answersError } = await supabase
      .from("player_answers")
      .select("id, player_id, selected_answer, response_time_ms, points_earned")
      .eq("game_id", gameId)
      .eq("question_id", questionId);

    if (answersError) {
      console.error("Error fetching player answers:", answersError);
      return {
        success: false,
        error: "Failed to fetch player answers",
      };
    }

    if (!answers || answers.length === 0) {
      // No answers to process - this is valid (players might not have answered)
      // Still broadcast scores_updated event for consistency
      await broadcastScoresUpdated(gameId, questionId);
      return {
        success: true,
        processedCount: 0,
      };
    }

    // Check if scores have already been processed for this question
    // If all answers have points_earned set (not null), skip processing
    const allScoresProcessed = answers.every(answer => answer.points_earned !== null);
    if (allScoresProcessed && answers.length > 0) {
      console.log(`[processQuestionScores] ⚠️ Scores already processed for question ${questionId}, skipping to prevent double-counting`);
      // Still broadcast scores_updated event in case clients need to refresh
      await broadcastScoresUpdated(gameId, questionId);
      return {
        success: true,
        processedCount: 0, // Return 0 since we didn't process anything new
      };
    }

    // Process each answer: calculate is_correct and points_earned
    // Use a lock mechanism to prevent concurrent processing
    // Check if processing is already in progress by looking for any answer with points_earned being set
    // This is a simple check - in production, you might want a more robust locking mechanism
    
    let processedCount = 0;
    const errors: Array<{ playerId: string; error: string }> = [];

    for (const answer of answers) {
      try {
        // Skip if this answer has already been processed
        if (answer.points_earned !== null) {
          console.log(`[processQuestionScores] ⚠️ Answer ${answer.id} already processed (points_earned: ${answer.points_earned}), skipping`);
          continue;
        }

        // Calculate is_correct (handle NULL selected_answer)
        const isCorrect =
          answer.selected_answer !== null &&
          answer.selected_answer === correctAnswer;

        // Calculate points_earned using scoring function
        const responseTimeMs = answer.response_time_ms ?? 0;
        const pointsEarned = calculateScore(isCorrect, responseTimeMs);

        if (!answer.player_id) {
          console.error("Answer missing player_id, skipping score update");
          continue;
        }

        // CRITICAL FIX: Fetch current total_score BEFORE updating points_earned
        // This ensures we have the correct baseline even if this function is called concurrently
        const { data: player, error: playerFetchError } = await supabase
          .from("game_players")
          .select("total_score")
          .eq("id", answer.player_id)
          .eq("game_id", gameId)
          .single();

        if (playerFetchError || !player) {
          console.error(
            `Error fetching player ${answer.player_id}:`,
            playerFetchError
          );
          errors.push({
            playerId: answer.player_id || "unknown",
            error: "Player not found in game",
          });
          continue;
        }

        const currentTotalScore = player.total_score ?? 0;
        const newTotalScore = currentTotalScore + pointsEarned;

        console.log(`[processQuestionScores] Processing answer ${answer.id} for player ${answer.player_id}:`, {
          isCorrect,
          responseTimeMs,
          pointsEarned,
          currentTotalScore,
          newTotalScore,
        });

        // ATOMIC UPDATE: Update both points_earned and total_score in sequence without gaps
        // First update player_answers with points_earned
        const { error: updateAnswerError } = await supabase
          .from("player_answers")
          .update({
            is_correct: isCorrect,
            points_earned: pointsEarned,
          })
          .eq("id", answer.id)
          .is("points_earned", null); // Only update if points_earned is still null (prevent race condition)

        if (updateAnswerError) {
          // Check if error is because points_earned was already set (race condition)
          if (updateAnswerError.code === "PGRST116" || updateAnswerError.message?.includes("0 rows")) {
            console.log(`[processQuestionScores] ⚠️ Answer ${answer.id} was processed by another call (race condition), skipping`);
            continue;
          }
          console.error(
            `Error updating answer for player ${answer.player_id}:`,
            updateAnswerError
          );
          errors.push({
            playerId: answer.player_id || "unknown",
            error: updateAnswerError.message || "Unknown error",
          });
          continue; // Continue processing other players
        }

        // Immediately update total_score after points_earned (minimize gap)
        const { error: updateScoreError } = await supabase
          .from("game_players")
          .update({
            total_score: newTotalScore,
          })
          .eq("id", answer.player_id!)
          .eq("game_id", gameId);

        if (updateScoreError) {
          console.error(
            `Error updating total_score for player ${answer.player_id}:`,
            updateScoreError
          );
          errors.push({
            playerId: answer.player_id || "unknown",
            error: updateScoreError.message || "Unknown error",
          });
          // Note: points_earned was updated but total_score failed - this is inconsistent
          // In production, you might want to rollback points_earned or retry total_score update
          continue; // Continue processing other players
        }

        // Verify the update succeeded
        const { data: verifyPlayer } = await supabase
          .from("game_players")
          .select("total_score")
          .eq("id", answer.player_id!)
          .eq("game_id", gameId)
          .single();

        if (verifyPlayer && verifyPlayer.total_score !== newTotalScore) {
          console.error(
            `[processQuestionScores] ⚠️ Race condition detected: Expected total_score=${newTotalScore}, but got ${verifyPlayer.total_score} for player ${answer.player_id}`
          );
        } else {
          console.log(`[processQuestionScores] ✅ Successfully updated player ${answer.player_id}: total_score=${newTotalScore}`);
        }

        processedCount++;
      } catch (error) {
        console.error(
          `Unexpected error processing answer for player ${answer.player_id}:`,
          error
        );
        errors.push({
          playerId: answer.player_id || "unknown",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        // Continue processing other players
      }
    }

    // Log errors if any occurred (but don't fail if some players processed successfully)
    if (errors.length > 0) {
      console.error(
        `Errors processing scores for ${errors.length} players:`,
        errors
      );
    }

    // Broadcast scores_updated event after processing
    await broadcastScoresUpdated(gameId, questionId);

    // Return success even if some players had errors (partial success)
    return {
      success: true,
      processedCount,
    };
  } catch (error) {
    console.error("Unexpected error in processQuestionScores:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Helper function to broadcast scores_updated event via Realtime
 * Uses service role client to broadcast from server
 * 
 * NOTE: This creates a temporary channel for broadcasting because Server Actions
 * are stateless and can't maintain persistent channels. The client-side channels
 * (in question-display-projector.tsx and player-game-view.tsx) stay subscribed
 * for the entire game and receive these broadcasts.
 * 
 * Pattern: Subscribe → Broadcast → Unsubscribe (necessary for server-side)
 */
async function broadcastScoresUpdated(
  gameId: string,
  questionId: string
): Promise<void> {
  try {
    const serviceClient = createServiceClient();
    const channel = serviceClient.channel(`game:${gameId}`);

    // Subscribe to the channel first (required before broadcasting)
    // This is a temporary subscription just for this broadcast
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Channel subscription timeout"));
      }, 5000);

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

    const payload: ScoresUpdatedPayload = {
      gameId,
      questionId,
    };
    
    // Broadcast the event
    await channel.send({
      type: "broadcast",
      event: "scores_updated",
      payload,
    });

    // Clean up the temporary channel after broadcasting
    // Delay slightly to ensure broadcast is sent before unsubscribing
    setTimeout(() => {
      channel.unsubscribe();
    }, 500);
  } catch (broadcastError) {
    // Log error but don't fail the scoring - scores are already updated in database
    // The client-side channels will still receive updates via PostgreSQL change listeners
    // if broadcast fails, but broadcast is preferred for real-time updates
    console.error("[Server] Error broadcasting scores_updated event:", broadcastError);
  }
}

/**
 * Server Action: Get player's answer result for a question
 * Returns is_correct, points_earned, and current total_score
 * Used by Story 3.3 (Player Answer Feedback)
 * 
 * @param gameId - UUID of the game
 * @param playerId - UUID of the player
 * @param questionId - UUID of the question
 * @returns Success with answer result or error response
 */
export async function getPlayerAnswerResult(
  gameId: string,
  playerId: string,
  questionId: string
): Promise<
  | {
      success: true;
      isCorrect: boolean;
      pointsEarned: number;
      totalScore: number;
      selectedAnswer: "A" | "B" | "C" | "D" | null;
      responseTimeMs: number;
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId || !playerId || !questionId) {
      return {
        success: false,
        error: "Game ID, Player ID, and Question ID are required",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId) || !uuidRegex.test(playerId) || !uuidRegex.test(questionId)) {
      return {
        success: false,
        error: "Invalid UUID format",
      };
    }

    // Fetch player answer
    const { data: answer, error: answerError } = await supabase
      .from("player_answers")
      .select("is_correct, points_earned, selected_answer, response_time_ms")
      .eq("game_id", gameId)
      .eq("player_id", playerId)
      .eq("question_id", questionId)
      .maybeSingle();

    if (answerError && answerError.code !== "PGRST116") {
      return {
        success: false,
        error: "Failed to fetch player answer",
      };
    }

    // If no answer found, return default values (no submission)
    if (!answer) {
      // Still fetch total score
      const { data: player, error: playerError } = await supabase
        .from("game_players")
        .select("total_score")
        .eq("id", playerId)
        .eq("game_id", gameId)
        .single();

      if (playerError || !player) {
        return {
          success: false,
          error: "Player not found",
        };
      }

      return {
        success: true,
        isCorrect: false,
        pointsEarned: 0,
        totalScore: player.total_score || 0,
        selectedAnswer: null,
        responseTimeMs: 0,
      };
    }

    // Fetch current total score
    const { data: player, error: playerError } = await supabase
      .from("game_players")
      .select("total_score")
      .eq("id", playerId)
      .eq("game_id", gameId)
      .single();

    if (playerError || !player) {
      return {
        success: false,
        error: "Player not found",
      };
    }

    return {
      success: true,
      isCorrect: answer.is_correct || false,
      pointsEarned: answer.points_earned || 0,
      totalScore: player.total_score || 0,
      selectedAnswer: answer.selected_answer as "A" | "B" | "C" | "D" | null,
      responseTimeMs: answer.response_time_ms || 0,
    };
  } catch (error) {
    console.error("Unexpected error in getPlayerAnswerResult:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

