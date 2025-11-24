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

    if (![3, 10, 15, 20].includes(questionCount)) {
      return {
        success: false,
        error: "Question count must be 3, 10, 15, or 20",
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

    // Note: Cleanup of old waiting games is now handled by a scheduled cron job
    // See: /api/cron/cleanup-waiting-games (configured in vercel.json)
    // This prevents cleanup from slowing down game creation

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
 * 
 * NOTE: This is currently not called automatically (removed from createGame/getPastGames).
 * For MVP, old games don't cost money - they're just database records.
 * Can be implemented later in production with a cron job if needed.
 * 
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
    // Note: Cleanup of old waiting games is now handled by a scheduled cron job
    // See: /api/cron/cleanup-waiting-games (configured in vercel.json)
    // This prevents cleanup from slowing down dashboard loading

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

    console.log(`[advanceQuestion] 📊 Current question index: ${currentIndex}, Next: ${nextIndex}, Total questions: ${game.question_count}`);

    if (nextIndex >= game.question_count) {
      // Game is complete - end game
      console.log(`[advanceQuestion] 🏁 Game complete! All ${game.question_count} questions finished. Ending game...`);
      const completedAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from("games")
        .update({
          status: "completed", // Database schema uses "completed", not "ended"
          completed_at: completedAt,
        })
        .eq("id", gameId);

      if (updateError) {
        console.error(`[advanceQuestion] ❌ Error ending game:`, updateError);
        return {
          success: false,
          error: "Failed to end game. Please try again.",
        };
      }

      console.log(`[advanceQuestion] ✅ Game status updated to "completed" at ${completedAt}`);

      // Revalidate paths
      revalidatePath(`/game/${gameId}/host`);
      revalidatePath(`/game/${gameId}/play`);

      // Note: Client will broadcast game_end event after receiving this response
      console.log(`[advanceQuestion] 📤 Returning gameEnded=true, client should broadcast game_end event`);
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
    console.log(`[advanceQuestion] 📝 Updating game: current_question_index = ${nextIndex} (question ${nextIndex + 1} of ${game.question_count})`);
    const { error: updateError } = await supabase
      .from("games")
      .update({
        current_question_index: nextIndex,
      })
      .eq("id", gameId);

    if (updateError) {
      console.error(`[advanceQuestion] ❌ Error updating game:`, updateError);
      return {
        success: false,
        error: "Failed to advance question. Please try again.",
      };
    }

    console.log(`[advanceQuestion] ✅ Game updated successfully`);

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

/**
 * Server Action: Fetch correct answer and scripture reference for answer reveal
 * Used by Story 3.2: Answer Reveal on Projector
 * 
 * @param gameId - UUID of the game
 * @param questionId - UUID of the question
 * @returns Success with correct answer, answer content, show_source flag, verse reference and verse content, or error response
 */
export async function broadcastAnswerReveal(
  gameId: string,
  questionId: string
): Promise<
  | { 
      success: true; 
      correctAnswer: string; 
      answerContent: string;
      showSource: boolean;
      verseReference: string | null;
      verseContent: string | null;
    }
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

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId) || !uuidRegex.test(questionId)) {
      return {
        success: false,
        error: "Invalid UUID format for game or question ID",
      };
    }

    // Verify game exists
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    // Fetch correct answer, answer content, show_source, verse reference and verse content from questions table
    const { data: question, error: questionError } = await supabase
      .from("questions")
      .select("correct_answer, right_answer_en, show_source, verse_reference_en, verse_content_en")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    // Validate correct_answer format
    if (!question.correct_answer || !["A", "B", "C", "D"].includes(question.correct_answer)) {
      return {
        success: false,
        error: "Invalid correct answer format",
      };
    }

    // Get the answer content (right_answer_en contains the full text)
    const answerContent = question.right_answer_en || "";

    return {
      success: true,
      correctAnswer: question.correct_answer,
      answerContent: answerContent,
      showSource: question.show_source || false,
      verseReference: question.verse_reference_en || null,
      verseContent: question.verse_content_en || null,
    };
  } catch (error) {
    console.error("Unexpected error in broadcastAnswerReveal:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action: Get leaderboard data for a game
 * Returns top 10 players ranked by total_score (DESC) and cumulative response time (ASC)
 * Used by Story 3.4 (Projector Leaderboard) and Story 3.5 (Personal Leaderboard)
 * 
 * @param gameId - UUID of the game
 * @returns Success with ranked players and total count, or error response
 */
export async function getLeaderboard(
  gameId: string
): Promise<
  | {
      success: true;
      players: Array<{
        playerId: string;
        playerName: string;
        totalScore: number;
        cumulativeResponseTimeMs: number;
        rank: number;
      }>;
      totalCount: number;
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId) {
      return {
        success: false,
        error: "Game ID is required",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      return {
        success: false,
        error: "Invalid UUID format for game ID",
      };
    }

    // Verify game exists
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      return {
        success: false,
        error: "Game not found",
      };
    }

    // Fetch all players for this game
    const { data: players, error: playersError } = await supabase
      .from("game_players")
      .select("id, player_name, total_score")
      .eq("game_id", gameId);

    if (playersError) {
      console.error("Error fetching players:", playersError);
      return {
        success: false,
        error: "Failed to fetch players",
      };
    }

    if (!players || players.length === 0) {
      return {
        success: true,
        players: [],
        totalCount: 0,
      };
    }

    // Calculate cumulative response time for each player
    const playersWithResponseTime = await Promise.all(
      players.map(async (player) => {
        // Sum all response_time_ms for this player across all questions
        const { data: answers, error: answersError } = await supabase
          .from("player_answers")
          .select("response_time_ms")
          .eq("game_id", gameId)
          .eq("player_id", player.id);

        if (answersError) {
          console.error(
            `Error fetching answers for player ${player.id}:`,
            answersError
          );
          return {
            playerId: player.id,
            playerName: player.player_name || "Unknown",
            totalScore: player.total_score || 0,
            cumulativeResponseTimeMs: 0,
          };
        }

        const cumulativeResponseTimeMs =
          answers?.reduce(
            (sum, answer) => sum + (answer.response_time_ms || 0),
            0
          ) || 0;

        return {
          playerId: player.id,
          playerName: player.player_name || "Unknown",
          totalScore: player.total_score || 0,
          cumulativeResponseTimeMs,
        };
      })
    );

    // Import calculateRankings from scoring utility
    const { calculateRankings } = await import("@/lib/game/scoring");
    const rankedPlayers = calculateRankings(playersWithResponseTime);

    // Map ranked players to include playerName
    const playersWithNames = rankedPlayers.map((ranked) => {
      const player = playersWithResponseTime.find((p) => p.playerId === ranked.playerId);
      return {
        ...ranked,
        playerName: player?.playerName || "Unknown",
      };
    });

    // Return top 10 players
    const topPlayers = playersWithNames.slice(0, 10);

    return {
      success: true,
      players: topPlayers,
      totalCount: playersWithNames.length,
    };
  } catch (error) {
    console.error("Unexpected error in getLeaderboard:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action: Get final results for projector view
 * Returns winner, all players ranked, and game statistics
 * 
 * @param gameId - UUID of the game
 * @returns Success with final results or error response
 */
export async function getFinalResults(
  gameId: string
): Promise<
  | {
      success: true;
      winner: {
        playerId: string;
        playerName: string;
        totalScore: number;
        cumulativeResponseTimeMs: number;
        rank: number;
      };
      players: Array<{
        playerId: string;
        playerName: string;
        totalScore: number;
        cumulativeResponseTimeMs: number;
        rank: number;
      }>;
      gameStats: {
        totalQuestions: number;
        gameDurationMinutes: number;
        averageScore: number;
      };
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId) {
      return {
        success: false,
        error: "Game ID is required",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      return {
        success: false,
        error: "Invalid UUID format for game ID",
      };
    }

    // Fetch game data with stats
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, question_count, started_at, completed_at, status")
      .eq("id", gameId)
      .single();

    if (gameError || !game) {
      console.error(`[getFinalResults] ❌ Error fetching game:`, gameError);
      return {
        success: false,
        error: "Game not found",
      };
    }
    
    console.log(`[getFinalResults] 📊 Game status: "${game.status}", completed_at: ${game.completed_at}`);
    
    // Don't check status - just proceed if game exists
    // The game might be transitioning to "completed" status

    // Fetch all players for this game
    const { data: players, error: playersError } = await supabase
      .from("game_players")
      .select("id, player_name, total_score")
      .eq("game_id", gameId);

    if (playersError) {
      console.error("Error fetching players:", playersError);
      return {
        success: false,
        error: "Failed to fetch players",
      };
    }

    if (!players || players.length === 0) {
      return {
        success: false,
        error: "No players found in game",
      };
    }

    // Calculate cumulative response time for each player
    const playersWithResponseTime = await Promise.all(
      players.map(async (player) => {
        // Sum all response_time_ms for this player across all questions
        const { data: answers, error: answersError } = await supabase
          .from("player_answers")
          .select("response_time_ms")
          .eq("game_id", gameId)
          .eq("player_id", player.id);

        if (answersError) {
          console.error(
            `Error fetching answers for player ${player.id}:`,
            answersError
          );
          return {
            playerId: player.id,
            playerName: player.player_name || "Unknown",
            totalScore: player.total_score || 0,
            cumulativeResponseTimeMs: 0,
          };
        }

        const cumulativeResponseTimeMs =
          answers?.reduce(
            (sum, answer) => sum + (answer.response_time_ms || 0),
            0
          ) || 0;

        return {
          playerId: player.id,
          playerName: player.player_name || "Unknown",
          totalScore: player.total_score || 0,
          cumulativeResponseTimeMs,
        };
      })
    );

    // Import calculateRankings from scoring utility
    const { calculateRankings } = await import("@/lib/game/scoring");
    const rankedPlayers = calculateRankings(playersWithResponseTime);

    // Map ranked players to include playerName
    const playersWithNames = rankedPlayers.map((ranked) => {
      const player = playersWithResponseTime.find((p) => p.playerId === ranked.playerId);
      return {
        ...ranked,
        playerName: player?.playerName || "Unknown",
      };
    });

    // Get winner (rank 1)
    const winner = playersWithNames.find((p) => p.rank === 1);
    if (!winner) {
      return {
        success: false,
        error: "Could not determine winner",
      };
    }

    // Calculate game stats
    const totalQuestions = game.question_count || 0;
    
    // Calculate game duration in minutes
    let gameDurationMinutes = 0;
    if (game.started_at && game.completed_at) {
      const startTime = new Date(game.started_at).getTime();
      const endTime = new Date(game.completed_at).getTime();
      const durationMs = endTime - startTime;
      gameDurationMinutes = Math.round(durationMs / (1000 * 60));
    }

    // Calculate average score
    const totalScoreSum = playersWithNames.reduce(
      (sum, player) => sum + player.totalScore,
      0
    );
    const averageScore =
      playersWithNames.length > 0
        ? Math.round(totalScoreSum / playersWithNames.length)
        : 0;

    return {
      success: true,
      winner,
      players: playersWithNames,
      gameStats: {
        totalQuestions,
        gameDurationMinutes,
        averageScore,
      },
    };
  } catch (error) {
    console.error("Unexpected error in getFinalResults:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * End/abort a game early
 * Updates game status to 'completed' and sets completed_at timestamp
 * Can be called by host to end the game at any time
 * 
 * @param gameId - UUID of the game to end
 * @returns Success or error response
 */
export async function endGame(
  gameId: string
): Promise<{ success: true; completedAt: string } | { success: false; error: string }> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId) {
      return {
        success: false,
        error: "Game ID is required",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId)) {
      return {
        success: false,
        error: "Invalid UUID format for game ID",
      };
    }

    // Verify game exists and is in 'active' or 'waiting' status
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

    if (game.status === "completed") {
      return {
        success: false,
        error: "Game is already completed",
      };
    }

    // Update game status to 'completed' and set completed_at
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

    return {
      success: true,
      completedAt,
    };
  } catch (error) {
    console.error("Unexpected error ending game:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Server Action: Get player's final results for player view
 * Returns player's rank, score, accuracy, average response time, and top 3
 * 
 * @param gameId - UUID of the game
 * @param playerId - UUID of the player
 * @returns Success with player final results or error response
 */
export async function getPlayerFinalResults(
  gameId: string,
  playerId: string
): Promise<
  | {
      success: true;
      playerRank: number;
      playerScore: number;
      accuracy: {
        correct: number;
        total: number;
        percentage: number;
      };
      averageResponseTime: number; // in seconds
      top3Players: Array<{
        playerId: string;
        playerName: string;
        totalScore: number;
        cumulativeResponseTimeMs: number;
        rank: number;
      }>;
      totalPlayers: number;
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // Validate inputs
    if (!gameId || !playerId) {
      return {
        success: false,
        error: "Game ID and Player ID are required",
      };
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(gameId) || !uuidRegex.test(playerId)) {
      return {
        success: false,
        error: "Invalid UUID format",
      };
    }

    // Get full leaderboard to find player's rank and top 3
    const finalResults = await getFinalResults(gameId);
    if (!finalResults.success) {
      return finalResults;
    }

    // Find player in leaderboard
    const player = finalResults.players.find((p) => p.playerId === playerId);
    if (!player) {
      return {
        success: false,
        error: "Player not found in game",
      };
    }

    // Fetch player's answers to calculate accuracy and average response time
    const { data: answers, error: answersError } = await supabase
      .from("player_answers")
      .select("is_correct, response_time_ms, selected_answer")
      .eq("game_id", gameId)
      .eq("player_id", playerId);

    if (answersError) {
      console.error("Error fetching player answers:", answersError);
      return {
        success: false,
        error: "Failed to fetch player answers",
      };
    }

    // Calculate accuracy
    const totalAnswered = answers?.filter(
      (answer) => answer.selected_answer !== null
    ).length || 0;
    const correctAnswers = answers?.filter(
      (answer) => answer.is_correct === true
    ).length || 0;
    const accuracyPercentage =
      totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    // Calculate average response time
    const totalResponseTimeMs =
      answers?.reduce(
        (sum, answer) => sum + (answer.response_time_ms || 0),
        0
      ) || 0;
    const answeredCount = answers?.filter(
      (answer) => answer.selected_answer !== null
    ).length || 1; // Avoid division by zero
    const averageResponseTimeSeconds =
      totalResponseTimeMs / (answeredCount * 1000); // Convert to seconds

    // Get top 3 players
    const top3Players = finalResults.players
      .filter((p) => p.rank <= 3)
      .slice(0, 3);

    return {
      success: true,
      playerRank: player.rank,
      playerScore: player.totalScore,
      accuracy: {
        correct: correctAnswers,
        total: totalAnswered,
        percentage: accuracyPercentage,
      },
      averageResponseTime: averageResponseTimeSeconds,
      top3Players,
      totalPlayers: finalResults.players.length,
    };
  } catch (error) {
    console.error("Unexpected error in getPlayerFinalResults:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

