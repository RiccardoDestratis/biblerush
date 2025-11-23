"use server";

import { createClient } from "@/lib/supabase/server";

export interface QuestionSet {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  difficulty: string | null;
  tier: string;
  isPublished: boolean;
  cardBackgroundUrl: string | null;
  order: number | null;
  status: string | null;
}

/**
 * Fetch all published question sets from the database
 */
export async function getQuestionSets(): Promise<
  | { success: true; questionSets: QuestionSet[] }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    const { data: questionSets, error } = await supabase
      .from("question_sets")
      .select("id, name_en, description_en, question_count, difficulty, tier_required, is_published, card_background_url, order")
      .eq("is_published", true)
      .order("order", { ascending: true, nullsFirst: false });

    if (error) {
      console.error("Error fetching question sets:", error);
      return {
        success: false,
        error: "Failed to fetch question sets",
      };
    }

    if (!questionSets || questionSets.length === 0) {
      return {
        success: true,
        questionSets: [],
      };
    }

    // Map and sort: items with order first (by order value), then items without order
    const mappedSets = questionSets.map((set) => ({
      id: set.id,
      name: set.name_en,
      description: set.description_en || "",
      questionCount: set.question_count || 0,
      difficulty: set.difficulty,
      tier: set.tier_required || "free",
      isPublished: set.is_published || false,
      cardBackgroundUrl: set.card_background_url || null,
      order: set.order ?? null,
      status: null, // Status column removed from database schema
    }));

    // Sort: items with order first (ascending), then items without order
    mappedSets.sort((a, b) => {
      // If both have order, sort by order
      if (a.order !== null && b.order !== null) {
        return a.order - b.order;
      }
      // If only a has order, a comes first
      if (a.order !== null && b.order === null) {
        return -1;
      }
      // If only b has order, b comes first
      if (a.order === null && b.order !== null) {
        return 1;
      }
      // If neither has order, maintain original order
      return 0;
    });

    return {
      success: true,
      questionSets: mappedSets,
    };
  } catch (error) {
    console.error("Error fetching question sets:", error);
    return {
      success: false,
      error: "Failed to fetch question sets",
    };
  }
}

