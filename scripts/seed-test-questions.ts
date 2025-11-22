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
    // First, ensure "Gospels: Life of Jesus" question set exists (used by create page)
    const gospelsTitle = "Gospels: Life of Jesus";
    let { data: gospelsSet } = await supabase
      .from("question_sets")
      .select("id")
      .eq("title", gospelsTitle)
      .single();

    if (!gospelsSet) {
      const { data: created, error: createError } = await supabase
        .from("question_sets")
        .insert({
          title: gospelsTitle,
          description: "Questions about the life, ministry, and teachings of Jesus Christ",
          tier_required: "free",
          is_published: true,
          question_count: 0,
        })
        .select()
        .single();

      if (createError || !created) {
        console.error("❌ Error creating Gospels question set:", createError);
        return;
      }
      gospelsSet = created;
    }

    if (!gospelsSet?.id) {
      console.error("❌ Failed to get or create Gospels question set");
      return;
    }

    console.log("✅ Using Gospels question set:", gospelsSet.id);

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

    // Sample test questions for both question sets
    const gospelsQuestions = [
      {
        question_set_id: gospelsSet!.id,
        question_text: "Where was Jesus born?",
        option_a: "Nazareth",
        option_b: "Bethlehem",
        option_c: "Jerusalem",
        option_d: "Capernaum",
        correct_answer: "B",
        scripture_reference: "Matthew 2:1",
        order_index: 1,
      },
      {
        question_set_id: gospelsSet.id,
        question_text: "How many disciples did Jesus have?",
        option_a: "10",
        option_b: "12",
        option_c: "15",
        option_d: "20",
        correct_answer: "B",
        scripture_reference: "Matthew 10:1",
        order_index: 2,
      },
      {
        question_set_id: gospelsSet.id,
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
        question_set_id: gospelsSet.id,
        question_text: "Who denied Jesus three times?",
        option_a: "Judas",
        option_b: "Peter",
        option_c: "Thomas",
        option_d: "John",
        correct_answer: "B",
        scripture_reference: "Matthew 26:75",
        order_index: 4,
      },
      {
        question_set_id: gospelsSet.id,
        question_text: "What was Jesus' first miracle?",
        option_a: "Walking on water",
        option_b: "Feeding 5000",
        option_c: "Turning water into wine",
        option_d: "Raising Lazarus",
        correct_answer: "C",
        scripture_reference: "John 2:1-11",
        order_index: 5,
      },
    ];

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

    // Insert Gospels questions
    const { data: gospelsQuestionsData, error: gospelsError } = await supabase
      .from("questions")
      .insert(gospelsQuestions)
      .select();

    if (gospelsError) {
      console.error("❌ Error inserting Gospels questions:", gospelsError);
      return;
    }

    console.log(`✅ Inserted ${gospelsQuestionsData.length} Gospels questions`);

    // Update Gospels question count
    const { error: gospelsUpdateError } = await supabase
      .from("question_sets")
      .update({ question_count: gospelsQuestionsData.length })
      .eq("id", gospelsSet.id);

    if (gospelsUpdateError) {
      console.error("❌ Error updating Gospels question count:", gospelsUpdateError);
      return;
    }

    // Insert test questions
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .insert(testQuestions)
      .select();

    if (questionsError) {
      console.error("❌ Error inserting questions:", questionsError);
      return;
    }

    console.log(`✅ Inserted ${questions.length} test questions`);

    // Update test question set count
    const { error: updateError } = await supabase
      .from("question_sets")
      .update({ question_count: questions.length })
      .eq("id", questionSet.id);

    if (updateError) {
      console.error("❌ Error updating question count:", updateError);
      return;
    }

    console.log("✅ Updated question counts");
    console.log("\n🎉 Seed script completed successfully!");
    console.log(`📊 Created ${gospelsQuestionsData.length} questions in: ${gospelsTitle}`);
    console.log(`📊 Created ${questions.length} questions in: ${questionSet.title}`);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

// Run the seed script
seedTestQuestions();

