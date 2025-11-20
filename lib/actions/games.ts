"use server";

import { createClient } from "@/lib/supabase/server";
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

  // Handle placeholder IDs
  const placeholderMap: Record<string, { title: string; description: string }> = {
    gospels: {
      title: "Gospels: Life of Jesus",
      description: "Questions about the life, ministry, and teachings of Jesus Christ",
    },
  };

  const placeholder = placeholderMap[questionSetId];
  if (!placeholder) {
    return null;
  }

  // Try to find existing question set by title
  const { data: existing } = await supabase
    .from("question_sets")
    .select("id")
    .eq("title", placeholder.title)
    .single();

  if (existing?.id) {
    return existing.id;
  }

  // Create the question set if it doesn't exist
  const { data: created, error } = await supabase
    .from("question_sets")
    .insert({
      title: placeholder.title,
      description: placeholder.description,
      tier_required: "free",
      is_published: true,
      question_count: 0,
    })
    .select("id")
    .single();

  if (error || !created?.id) {
    console.error("Error creating question set:", error);
    return null;
  }

  return created.id;
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
        question_set_title: string | null;
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
          title
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
        let questionSetTitle: string | null = null;
        if (game.question_sets) {
          if (Array.isArray(game.question_sets)) {
            questionSetTitle =
              game.question_sets.length > 0 &&
              typeof game.question_sets[0] === "object" &&
              "title" in game.question_sets[0]
                ? (game.question_sets[0] as { title: string }).title
                : null;
          } else if (typeof game.question_sets === "object" && "title" in game.question_sets) {
            questionSetTitle = (game.question_sets as { title: string }).title;
          }
        }

        return {
          id: game.id,
          room_code: game.room_code,
          status: game.status || "waiting",
          question_count: game.question_count,
          created_at: game.created_at || new Date().toISOString(),
          question_set_title: questionSetTitle,
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


