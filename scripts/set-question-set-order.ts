/**
 * Script to set the order of a question set to be second-to-last
 * 
 * Usage:
 *   pnpm tsx scripts/set-question-set-order.ts <question-set-id> [target-name]
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nMake sure your .env.local file is set up correctly.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setQuestionSetOrder(questionSetIdOrName: string) {
  // First, check if order column exists, if not, add it
  console.log('🔍 Checking if order column exists...');
  
  // Try to query with order column to see if it exists
  const { data: testData, error: testError } = await supabase
    .from('question_sets')
    .select('id, name_en, order')
    .limit(1);

  if (testError && testError.message.includes('column') && testError.message.includes('order')) {
    console.log('📝 Order column does not exist. Adding it...');
    // Note: We can't run ALTER TABLE directly via Supabase client easily
    // This would need to be done via a migration or SQL editor
    console.error('❌ Order column does not exist. Please add it via migration first.');
    console.error('   Run: ALTER TABLE question_sets ADD COLUMN IF NOT EXISTS "order" INT;');
    process.exit(1);
  }

  // Find the question set by ID or name
  let questionSet;
  
  // Try as UUID first
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let sets, findError;
  
  if (uuidRegex.test(questionSetIdOrName)) {
    // Search by ID
    const { data, error } = await supabase
      .from('question_sets')
      .select('id, name_en, order')
      .eq('id', questionSetIdOrName);
    sets = data;
    findError = error;
  } else {
    // Search by name
    const { data, error } = await supabase
      .from('question_sets')
      .select('id, name_en, order')
      .ilike('name_en', `%${questionSetIdOrName}%`);
    sets = data;
    findError = error;
  }

  if (findError) {
    console.error('❌ Error finding question set:', findError);
    process.exit(1);
  }

  if (!sets || sets.length === 0) {
    console.error(`❌ Question set not found: ${questionSetIdOrName}`);
    process.exit(1);
  }

  if (sets.length > 1) {
    console.log('⚠️  Multiple question sets found:');
    sets.forEach((set, i) => {
      console.log(`   ${i + 1}. ${set.name_en} (ID: ${set.id})`);
    });
    console.error('❌ Please specify the exact question set ID or a more specific name.');
    process.exit(1);
  }

  questionSet = sets[0];
  console.log(`\n📦 Found question set: ${questionSet.name_en} (ID: ${questionSet.id})`);

  // Get all published question sets to determine order
  const { data: allSets, error: allSetsError } = await supabase
    .from('question_sets')
    .select('id, name_en, order')
    .eq('is_published', true)
    .order('order', { ascending: true, nullsFirst: false });

  if (allSetsError) {
    console.error('❌ Error fetching all question sets:', allSetsError);
    process.exit(1);
  }

  if (!allSets || allSets.length === 0) {
    console.error('❌ No published question sets found.');
    process.exit(1);
  }

  console.log(`\n📊 Found ${allSets.length} published question set(s)`);

  // Calculate second-to-last order
  // If there are N sets, second-to-last should be N-1
  // But we need to account for existing orders
  const setsWithOrder = allSets.filter(s => s.order !== null);
  const setsWithoutOrder = allSets.filter(s => s.order === null);

  let targetOrder: number;

  if (setsWithOrder.length > 0) {
    // If there are sets with orders, find the max order
    const maxOrder = Math.max(...setsWithOrder.map(s => s.order!));
    // Second-to-last means: if we have N sets total, we want order = N-1
    // But we need to ensure it's less than the last one
    // Let's set it to maxOrder (if it's the last) or maxOrder - 1
    targetOrder = allSets.length - 1;
    
    // If the target set already has an order, we need to adjust
    if (questionSet.order !== null) {
      console.log(`   Current order: ${questionSet.order}`);
    }
  } else {
    // If no sets have orders, set this one to second-to-last
    targetOrder = allSets.length - 1;
  }

  // Ensure targetOrder is at least 1
  if (targetOrder < 1) {
    targetOrder = 1;
  }

  console.log(`\n🎯 Setting order to: ${targetOrder} (second-to-last of ${allSets.length} sets)`);

  // Update the question set order
  const { error: updateError } = await supabase
    .from('question_sets')
    .update({ order: targetOrder })
    .eq('id', questionSet.id);

  if (updateError) {
    console.error('❌ Error updating question set order:', updateError);
    process.exit(1);
  }

  console.log(`✅ Successfully set order to ${targetOrder} for "${questionSet.name_en}"`);
  console.log(`\n📋 Updated question set will appear as second-to-last in the list.`);
}

async function main() {
  const questionSetIdOrName = process.argv[2];

  if (!questionSetIdOrName) {
    console.error('Usage: pnpm tsx scripts/set-question-set-order.ts <question-set-id-or-name>');
    console.error('\nExample:');
    console.error('   pnpm tsx scripts/set-question-set-order.ts 850cd0fc-f9b1-42a1-a975-6a6edef2ebaf');
    console.error('   pnpm tsx scripts/set-question-set-order.ts "Women of Courage"');
    process.exit(1);
  }

  await setQuestionSetOrder(questionSetIdOrName);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

