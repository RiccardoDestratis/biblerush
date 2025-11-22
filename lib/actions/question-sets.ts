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
      .select("id, name_en, description_en, question_count, difficulty, tier_required, is_published")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

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

    return {
      success: true,
      questionSets: questionSets.map((set) => ({
        id: set.id,
        name: set.name_en,
        description: set.description_en || "",
        questionCount: set.question_count || 0,
        difficulty: set.difficulty,
        tier: set.tier_required || "free",
        isPublished: set.is_published || false,
      })),
    };
  } catch (error) {
    console.error("Error fetching question sets:", error);
    return {
      success: false,
      error: "Failed to fetch question sets",
    };
  }
}

