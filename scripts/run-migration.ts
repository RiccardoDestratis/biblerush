/**
 * Script to run database migrations against Supabase
 * 
 * Usage:
 *   pnpm tsx scripts/run-migration.ts <migration-file>
 * 
 * Example:
 *   pnpm tsx scripts/run-migration.ts migrations/002_add_multilingual_support.sql
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

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

async function runMigration(migrationFilePath: string) {
  const fullPath = path.resolve(migrationFilePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Migration file not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`📖 Reading migration file: ${fullPath}`);
  const sql = fs.readFileSync(fullPath, 'utf-8');

  // Split SQL into individual statements (semicolon-separated)
  // Remove comments and empty lines
  const statements = sql
    .split(';')
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`\n📝 Found ${statements.length} SQL statement(s) to execute\n`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comment-only lines
    if (statement.startsWith('--') || statement.length === 0) {
      continue;
    }

    console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      // Use RPC to execute raw SQL (requires postgres functions enabled)
      // Alternative: Use Supabase REST API with service role key
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';',
      });

      if (error) {
        // Try direct query execution
        const { error: queryError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(0);

        // If that fails, we need to use a different approach
        // Supabase doesn't allow direct SQL execution via JS client
        // User needs to run this in Supabase SQL Editor
        console.error('\n❌ Cannot execute SQL directly via Supabase JS client.');
        console.error('   Supabase requires SQL to be run through the SQL Editor.');
        console.error('\n📋 Please run this migration manually:');
        console.error(`   1. Go to your Supabase Dashboard`);
        console.error(`   2. Navigate to SQL Editor`);
        console.error(`   3. Copy and paste the contents of: ${fullPath}`);
        console.error(`   4. Click "Run" to execute the migration\n`);
        process.exit(1);
      }

      console.log(`   ✅ Statement ${i + 1} executed successfully`);
    } catch (error: any) {
      console.error(`   ❌ Error executing statement ${i + 1}:`, error.message);
      console.error('\n📋 Please run this migration manually in Supabase SQL Editor:');
      console.error(`   File: ${fullPath}\n`);
      process.exit(1);
    }
  }

  console.log('\n✅ Migration completed successfully!');
}

async function main() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: pnpm tsx scripts/run-migration.ts <migration-file>');
    console.error('Example: pnpm tsx scripts/run-migration.ts migrations/002_add_multilingual_support.sql');
    process.exit(1);
  }

  await runMigration(migrationFile);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

