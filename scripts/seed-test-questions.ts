/**
 * Seed script for test questions
 * Run with: pnpm tsx scripts/seed-test-questions.ts
 * 
 * This creates a test question set with 5-10 sample questions for development
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅" : "❌");
  console.error("\nMake sure your .env.local file is set up correctly.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTestQuestions() {
  console.log("🌱 Starting seed script...");

  try {
    // Create a test question set
    const { data: questionSet, error: setError } = await supabase
      .from("question_sets")
      .insert({
        title: "Test Question Set",
        description: "Sample questions for development and testing",
        tier_required: "free",
        is_published: true,
      })
      .select()
      .single();

    if (setError) {
      console.error("❌ Error creating question set:", setError);
      return;
    }

    console.log("✅ Created question set:", questionSet.id);

    // Sample test questions
    const testQuestions = [
      {
        question_set_id: questionSet.id,
        question_text: "What is the first book of the Bible?",
        option_a: "Exodus",
        option_b: "Psalms",
        option_c: "Genesis",
        option_d: "Matthew",
        correct_answer: "C",
        scripture_reference: "Genesis 1:1",
        order_index: 1,
      },
      {
        question_set_id: questionSet.id,
        question_text: "Who built the ark?",
        option_a: "Moses",
        option_b: "Noah",
        option_c: "Abraham",
        option_d: "David",
        correct_answer: "B",
        scripture_reference: "Genesis 6:14",
        order_index: 2,
      },
      {
        question_set_id: questionSet.id,
        question_text: "What is the shortest verse in the Bible?",
        option_a: "Jesus wept.",
        option_b: "Rejoice always.",
        option_c: "Love one another.",
        option_d: "Pray without ceasing.",
        correct_answer: "A",
        scripture_reference: "John 11:35",
        order_index: 3,
      },
      {
        question_set_id: questionSet.id,
        question_text: "Who was thrown into the lions' den?",
        option_a: "Daniel",
        option_b: "David",
        option_c: "Joseph",
        option_d: "Moses",
        correct_answer: "A",
        scripture_reference: "Daniel 6:16",
        order_index: 4,
      },
      {
        question_set_id: questionSet.id,
        question_text: "How many books are in the New Testament?",
        option_a: "27",
        option_b: "39",
        option_c: "66",
        option_d: "73",
        correct_answer: "A",
        scripture_reference: "Various",
        order_index: 5,
      },
    ];

    // Insert questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .insert(testQuestions)
      .select();

    if (questionsError) {
      console.error("❌ Error inserting questions:", questionsError);
      return;
    }

    console.log(`✅ Inserted ${questions.length} test questions`);

    // Update question count
    const { error: updateError } = await supabase
      .from("question_sets")
      .update({ question_count: questions.length })
      .eq("id", questionSet.id);

    if (updateError) {
      console.error("❌ Error updating question count:", updateError);
      return;
    }

    console.log("✅ Updated question count");
    console.log("\n🎉 Seed script completed successfully!");
    console.log(`📊 Created ${questions.length} questions in question set: ${questionSet.title}`);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the seed script
seedTestQuestions();

