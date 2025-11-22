"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Question data structure
 */
export interface QuestionData {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  scriptureReference?: string;
}

/**
 * Fetch a single question by question set ID and order index
 * @param questionSetId - UUID of the question set
 * @param orderIndex - Order index of the question (1-based)
 * @returns Question data or error
 */
export async function getQuestion(
  questionSetId: string,
  orderIndex: number
): Promise<
  | { success: true; question: QuestionData }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    const { data: question, error } = await supabase
      .from("questions")
      .select("id, question_en, option_a_en, option_b_en, option_c_en, option_d_en, correct_answer, verse_reference_en")
      .eq("question_set_id", questionSetId)
      .eq("order_index", orderIndex)
      .single();

    if (error || !question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    return {
      success: true,
      question: {
        id: question.id,
        questionText: question.question_en,
        options: [
          question.option_a_en,
          question.option_b_en,
          question.option_c_en,
          question.option_d_en,
        ],
        correctAnswer: question.correct_answer,
        scriptureReference: question.verse_reference_en || undefined,
      },
    };
  } catch (error) {
    console.error("Error fetching question:", error);
    return {
      success: false,
      error: "Failed to fetch question",
    };
  }
}

/**
 * Fetch multiple questions for pre-loading
 * @param questionSetId - UUID of the question set
 * @param startIndex - Starting order index (1-based)
 * @param count - Number of questions to fetch
 * @returns Array of question data or error
 */
export async function getQuestions(
  questionSetId: string,
  startIndex: number,
  count: number
): Promise<
  | { success: true; questions: QuestionData[] }
  | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, question_en, option_a_en, option_b_en, option_c_en, option_d_en, correct_answer, verse_reference_en")
      .eq("question_set_id", questionSetId)
      .gte("order_index", startIndex)
      .lt("order_index", startIndex + count)
      .order("order_index", { ascending: true });

    if (error) {
      return {
        success: false,
        error: "Failed to fetch questions",
      };
    }

    if (!questions || questions.length === 0) {
      return {
        success: true,
        questions: [],
      };
    }

    return {
      success: true,
      questions: questions.map((q) => ({
        id: q.id,
        questionText: q.question_en,
        options: [
          q.option_a_en,
          q.option_b_en,
          q.option_c_en,
          q.option_d_en,
        ],
        correctAnswer: q.correct_answer,
        scriptureReference: q.verse_reference_en || undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching questions:", error);
    return {
      success: false,
      error: "Failed to fetch questions",
    };
  }
}

