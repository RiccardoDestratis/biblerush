"use server";

import { createClient } from "@/lib/supabase/server";
import type { QuestionAdvancePayload } from "@/lib/types/realtime";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Generate a unique 6-character room code (uppercase alphanumeric)
 * Checks database for uniqueness before returning
 */
async function generateUniqueRoomCode(): Promise<string> {
  const supabase = await createClient();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate 6-character code: uppercase letters and numbers
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if code already exists
    const { data, error } = await supabase
      .from("games")
      .select("room_code")
      .eq("room_code", code)
      .single();

    if (error && error.code === "PGRST116") {
      // No rows found - code is unique
      return code;
    }

    if (!data) {
      // Code doesn't exist - it's unique
      return code;
    }

    attempts++;
  }

  // Fallback: if we can't find unique code after 10 attempts, throw error
  throw new Error("Failed to generate unique room code after multiple attempts");
}

/**
 * Get or create a question set by placeholder ID or title
 * For MVP, handles placeholder IDs like "gospels" by finding or creating the set
 */
async function getOrCreateQuestionSet(
  supabase: Awaited<ReturnType<typeof createClient>>,
  questionSetId: string
): Promise<string | null> {
  // If it's a valid UUID format, use it directly
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(questionSetId)) {
    // Verify it exists
    const { data } = await supabase
      .from("question_sets")
      .select("id")
      .eq("id", questionSetId)
      .single();
    return data?.id || null;
  }

  // If it's not a UUID, it's invalid (no more placeholder support)
  console.error("Invalid question set ID format:", questionSetId);
  return null;
}

/**
 * Create a new game
 * @param questionSetId - UUID or placeholder ID of the selected question set
 * @param questionCount - Number of questions (10, 15, or 20)
 * @returns Game ID for redirect
 */
export async function createGame(
  questionSetId: string,
  questionCount: number
): Promise<{ success: true; gameId: string } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!questionSetId || !questionCount) {
      return {
        success: false,
        error: "Question set and question count are required",
      };
    }

    if (![10, 15, 20].includes(questionCount)) {
      return {
        success: false,
        error: "Question count must be 10, 15, or 20",
      };
    }

    // Get or create question set
    const actualQuestionSetId = await getOrCreateQuestionSet(supabase, questionSetId);
    if (!actualQuestionSetId) {
      return {
        success: false,
        error: "Invalid question set selected",
      };
    }

    // Clean up old waiting games before creating new one (prevents accumulation)
    // In production, this should be a scheduled cron job instead
    await cleanupOldWaitingGames(30);

    // Generate unique room code
    const roomCode = await generateUniqueRoomCode();

    // Stub host_id for MVP (auth will be added in Epic 5)
    // Using NULL since schema allows it (ON DELETE SET NULL)
    // In production this will be auth.user.id

    // Insert game into database
    const { data, error } = await supabase
      .from("games")
      .insert({
        host_id: null, // NULL for MVP, will be set to auth.user.id in Epic 5
        room_code: roomCode,
        question_set_id: actualQuestionSetId,
        question_count: questionCount,
        status: "waiting",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating game:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      return {
        success: false,
        error: `Failed to create game: ${error.message || "Please try again."}`,
      };
    }

    if (!data?.id) {
      return {
        success: false,
        error: "Failed to create game. Please try again.",
      };
    }

    // Revalidate paths
    revalidatePath("/create");
    revalidatePath("/dashboard");

    return {
      success: true,
      gameId: data.id,
    };
  } catch (error) {
    console.error("Unexpected error creating game:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Get game by ID
 * @param gameId - UUID of the game
 * @returns Game data or error
 */
export async function getGame(gameId: string): Promise<
  | { success: true; game: { id: string; room_code: string; status: string } }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("games")
      .select("id, room_code, status")
      .eq("id", gameId)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    return {
      success: true,
      game: {
        id: data.id,
        room_code: data.room_code,
        status: data.status || "waiting", // Default to "waiting" if null
      },
    };
  } catch (error) {
    console.error("Error fetching game:", error);
    return {
      success: false,
      error: "Failed to fetch game",
    };
  }
}

/**
 * Cancel/delete a game
 * @param gameId - UUID of the game to cancel
 * @returns Success or error
 */
export async function cancelGame(
  gameId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    // Delete game (CASCADE will handle related records)
    const { error } = await supabase.from("games").delete().eq("id", gameId);

    if (error) {
      console.error("Error canceling game:", error);
      return {
        success: false,
        error: "Failed to cancel game. Please try again.",
      };
    }

    // Revalidate paths
    revalidatePath("/create");
    revalidatePath("/dashboard");
    revalidatePath(`/game/${gameId}/host`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error canceling game:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Clean up old waiting games that haven't been started
 * Deletes games in 'waiting' status that are older than the specified minutes
 * @param maxAgeMinutes - Maximum age in minutes before cleanup (default: 30)
 * @returns Number of games deleted
 */
export async function cleanupOldWaitingGames(
  maxAgeMinutes: number = 30
): Promise<{ success: true; deletedCount: number } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    // Calculate cutoff time
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxAgeMinutes);

    // Find and delete old waiting games
    const { data: oldGames, error: findError } = await supabase
      .from("games")
      .select("id")
      .eq("status", "waiting")
      .lt("created_at", cutoffTime.toISOString());

    if (findError) {
      console.error("Error finding old waiting games:", findError);
      return {
        success: false,
        error: "Failed to find old games",
      };
    }

    if (!oldGames || oldGames.length === 0) {
      return {
        success: true,
        deletedCount: 0,
      };
    }

    // Delete old games (CASCADE will handle related records)
    const gameIds = oldGames.map((g) => g.id);
    const { error: deleteError } = await supabase
      .from("games")
      .delete()
      .in("id", gameIds);

    if (deleteError) {
      console.error("Error deleting old waiting games:", deleteError);
      return {
        success: false,
        error: "Failed to delete old games",
      };
    }

    // Revalidate paths
    revalidatePath("/dashboard");
    revalidatePath("/create");

    return {
      success: true,
      deletedCount: oldGames.length,
    };
  } catch (error) {
    console.error("Unexpected error cleaning up old games:", error);
    return {
      success: false,
      error: "Failed to clean up old games",
    };
  }
}

/**
 * Get past games for dashboard
 * For MVP, fetches all games (host_id is NULL). In Epic 5, will filter by authenticated user.
 * Automatically cleans up old waiting games before fetching.
 * @returns List of past games with question set info and player counts
 */
export async function getPastGames(): Promise<
  | {
      success: true;
      games: Array<{
        id: string;
        room_code: string;
        status: string;
        question_count: number;
        created_at: string;
        question_set_name: string | null;
        player_count: number;
      }>;
    }
  | { success: false; error: string }
> {
  try {
    // Clean up old waiting games (30 minutes old) before fetching
    // This prevents accumulation of abandoned games
    await cleanupOldWaitingGames(30);

    const supabase = await createClient();

    // For MVP: Fetch all games (host_id is NULL)
    // In Epic 5: Add WHERE host_id = auth.user.id
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select(
        `
        id,
        room_code,
        status,
        question_count,
        created_at,
        question_set_id,
        question_sets (
          name_en
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(50); // Limit to 50 most recent games

    if (gamesError) {
      console.error("Error fetching games:", gamesError);
      return {
        success: false,
        error: "Failed to fetch games",
      };
    }

    if (!games || games.length === 0) {
      return {
        success: true,
        games: [],
      };
    }

    // Get player counts for each game
    const gamesWithPlayerCounts = await Promise.all(
      games.map(async (game) => {
        const { count, error: countError } = await supabase
          .from("game_players")
          .select("*", { count: "exact", head: true })
          .eq("game_id", game.id);

        const playerCount = countError ? 0 : count || 0;

        // Handle question_sets relation (Supabase returns as array or object)
        let questionSetName: string | null = null;
        if (game.question_sets) {
          if (Array.isArray(game.question_sets)) {
            questionSetName =
              game.question_sets.length > 0 &&
              typeof game.question_sets[0] === "object" &&
              "name_en" in game.question_sets[0]
                ? (game.question_sets[0] as { name_en: string }).name_en
                : null;
          } else if (typeof game.question_sets === "object" && "name_en" in game.question_sets) {
            questionSetName = (game.question_sets as { name_en: string }).name_en;
          }
        }

        return {
          id: game.id,
          room_code: game.room_code,
          status: game.status || "waiting",
          question_count: game.question_count,
          created_at: game.created_at || new Date().toISOString(),
          question_set_name: questionSetName,
          player_count: playerCount,
        };
      })
    );

    return {
      success: true,
      games: gamesWithPlayerCounts,
    };
  } catch (error) {
    console.error("Unexpected error fetching past games:", error);
    return {
      success: false,
      error: "Failed to fetch games",
    };
  }
}

/**
 * Start a game by updating status, fetching first question, and broadcasting game_start event
 * @param gameId - UUID of the game to start
 * @returns Question data on success, error message on failure
 */
export async function startGame(
  gameId: string
): Promise<
  | {
      success: true;
      questionData: {
        questionId: string;
        questionText: string;
        options: string[];
        questionNumber: number;
        timerDuration: number;
        startedAt: string;
        questionSetId: string;
        totalQuestions: number;
      };
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // 1. Validate game exists and is in 'waiting' status
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, status, question_set_id, question_count")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    if (game.status !== "waiting") {
      return {
        success: false,
        error: `Game cannot be started. Current status: ${game.status}`,
      };
    }

    // Validate question_set_id exists
    if (!game.question_set_id) {
      return {
        success: false,
        error: "Game does not have a question set assigned",
      };
    }

    // 2. Validate at least 1 player has joined
    const { count, error: countError } = await supabase
      .from("game_players")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId);

    if (countError) {
      return {
        success: false,
        error: "Failed to check player count",
      };
    }

    if (!count || count === 0) {
      return {
        success: false,
        error: "At least 1 player must join before starting the game",
      };
    }

    // 3. Fetch first question (order_index = 1)
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, question_en, option_a_en, option_b_en, option_c_en, option_d_en, correct_answer, verse_reference_en")
      .eq("question_set_id", game.question_set_id)
      .eq("order_index", 1)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: "Failed to load first question. Please ensure the question set has questions.",
      };
    }

    // 4. Update games table: status='active', started_at=NOW(), current_question_index=0
    const startedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("games")
      .update({
        status: "active",
        started_at: startedAt,
        current_question_index: 0,
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating game:", updateError);
      return {
        success: false,
        error: "Failed to start game. Please try again.",
      };
    }

    // 5. Format question data payload
    const questionData = {
      questionId: question.id,
      questionText: question.question_en,
      options: [
        question.option_a_en,
        question.option_b_en,
        question.option_c_en,
        question.option_d_en,
      ],
      questionNumber: 1,
      timerDuration: 15,
      startedAt,
      totalQuestions: game.question_count, // Include total questions from game data
    };

    // 6. Note: Realtime broadcast will be done client-side after receiving this response
    // The client (host waiting room) will broadcast the game_start event to all subscribers
    // PostgreSQL change tracking will also notify clients about the status change

    // Revalidate paths
    revalidatePath(`/game/${gameId}/host`);
    revalidatePath(`/game/${gameId}/play`);

    return {
      success: true,
      questionData: {
        ...questionData,
        questionSetId: game.question_set_id!, // Include for pre-loading (validated above)
      },
    };
  } catch (error) {
    console.error("Unexpected error starting game:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Advance game to next question by incrementing current_question_index and fetching next question
 * Called after leaderboard phase completes (Story 3.4)
 * If all questions are complete, ends the game instead
 * @param gameId - UUID of the game to advance
 * @returns Question data on success, error message on failure, or game_end signal
 */
export async function advanceQuestion(
  gameId: string
): Promise<
  | {
      success: true;
      questionData: QuestionAdvancePayload;
      gameEnded: false;
    }
  | { success: true; gameEnded: true; completedAt: string }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // 1. Validate game exists and is in 'active' status
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, status, question_set_id, question_count, current_question_index")
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
        error: `Game cannot be advanced. Current status: ${game.status}`,
      };
    }

    // Validate question_set_id exists
    if (!game.question_set_id) {
      return {
        success: false,
        error: "Game does not have a question set assigned",
      };
    }

    // 2. Check if all questions are complete
    const currentIndex = game.current_question_index ?? 0;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= game.question_count) {
      // Game is complete - end game
      const completedAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("games")
        .update({
          status: "completed",
          completed_at: completedAt,
        })
        .eq("id", gameId);

      if (updateError) {
        console.error("Error ending game:", updateError);
        return {
          success: false,
          error: "Failed to end game. Please try again.",
        };
      }

      // Revalidate paths
      revalidatePath(`/game/${gameId}/host`);
      revalidatePath(`/game/${gameId}/play`);

      // Note: Client will broadcast game_end event after receiving this response
      return {
        success: true,
        gameEnded: true,
        completedAt,
      };
    }

    // 3. Fetch next question (order_index = nextIndex + 1, since order_index is 1-based)
    const nextQuestionOrderIndex = nextIndex + 1;
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("id, question_en, option_a_en, option_b_en, option_c_en, option_d_en, correct_answer, verse_reference_en")
      .eq("question_set_id", game.question_set_id)
      .eq("order_index", nextQuestionOrderIndex)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: `Failed to load question ${nextQuestionOrderIndex}. The question set may be incomplete.`,
      };
    }

    // 4. Update games table: current_question_index = nextIndex
    const startedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("games")
      .update({
        current_question_index: nextIndex,
      })
      .eq("id", gameId);

    if (updateError) {
      console.error("Error updating game:", updateError);
      return {
        success: false,
        error: "Failed to advance question. Please try again.",
      };
    }

    // 5. Format question data payload for broadcast
    const questionData = {
      questionIndex: nextIndex, // 0-based index
      questionNumber: nextIndex + 1, // Display question number (1-based)
      questionId: question.id,
      questionText: question.question_en,
      options: [
        question.option_a_en,
        question.option_b_en,
        question.option_c_en,
        question.option_d_en,
      ],
      correctAnswer: question.correct_answer,
      scriptureReference: question.verse_reference_en || undefined,
      timerDuration: 15,
      startedAt,
      totalQuestions: game.question_count,
      questionSetId: game.question_set_id || "",
    };

    // 6. Note: Realtime broadcast will be done client-side after receiving this response
    // The client (host leaderboard component) will broadcast the question_advance event to all subscribers
    // PostgreSQL change tracking will also notify clients about the current_question_index change

    // Revalidate paths
    revalidatePath(`/game/${gameId}/host`);
    revalidatePath(`/game/${gameId}/play`);

    return {
      success: true,
      questionData,
      gameEnded: false,
    };
  } catch (error) {
    console.error("Unexpected error advancing question:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

