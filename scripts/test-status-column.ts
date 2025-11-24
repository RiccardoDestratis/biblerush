/**
 * Test script to check if status column exists and test the coming soon functionality
 */

import { createClient } from '@/lib/supabase/server';

async function testStatusColumn() {
  try {
    const supabase = await createClient();
    
    // Try to query with status column
    const { data, error } = await supabase
      .from('question_sets')
      .select('id, name_en, status')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying question_sets:', error.message);
      if (error.message.includes('column') && error.message.includes('status')) {
        console.error('\n📋 The status column does not exist. Please run the migration:');
        console.error('   migrations/003_add_question_set_status.sql');
        console.error('\n   Run it in Supabase SQL Editor.');
        return;
      }
      throw error;
    }
    
    console.log('✅ Status column exists (or Supabase is ignoring unknown columns)');
    console.log('📊 Sample data:', data?.[0]);
    
    // Check if any sets have status = 'locked'
    const { data: lockedSets, error: lockedError } = await supabase
      .from('question_sets')
      .select('id, name_en, status')
      .eq('status', 'locked');
    
    if (lockedError) {
      console.error('⚠️  Error checking for locked sets:', lockedError.message);
    } else {
      console.log(`\n📋 Found ${lockedSets?.length || 0} question set(s) with status='locked'`);
      if (lockedSets && lockedSets.length > 0) {
        console.log('   Locked sets:', lockedSets.map(s => s.name_en));
      } else {
        console.log('\n💡 To test the "coming soon" overlay:');
        console.log('   1. Update a question set in Supabase');
        console.log('   2. Set its status column to "locked"');
        console.log('   3. Refresh the /create page');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
  }
}

testStatusColumn();

