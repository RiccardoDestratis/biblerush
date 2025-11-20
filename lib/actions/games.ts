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

    // Generate unique room code
    const roomCode = await generateUniqueRoomCode();

    // Stub host_id for MVP (auth will be added in Epic 5)
    // Using a placeholder UUID - in production this will be auth.user.id
    const stubHostId = "00000000-0000-0000-0000-000000000000";

    // Insert game into database
    const { data, error } = await supabase
      .from("games")
      .insert({
        host_id: stubHostId,
        room_code: roomCode,
        question_set_id: actualQuestionSetId,
        question_count: questionCount,
        status: "waiting",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating game:", error);
      return {
        success: false,
        error: "Failed to create game. Please try again.",
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
        status: data.status,
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


