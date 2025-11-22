import { createClient } from "@/lib/supabase/server";

/**
 * Test page to verify Supabase connection
 * This is a temporary page for Story 1.2 - can be removed later
 */
export default async function TestSupabasePage() {
  const supabase = await createClient();
  
  // Test query: fetch question_sets (should return empty array initially)
  const { data: questionSets, error } = await supabase
    .from("question_sets")
    .select("*")
    .limit(5);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          Supabase Connection Test
        </h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Connection Error:</p>
            <p>{error.message}</p>
            <p className="mt-2 text-sm">
              Make sure you have:
              <ul className="list-disc list-inside mt-2">
                <li>Created a Supabase project</li>
                <li>Set up your .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>Run the database migration (001_initial_schema.sql) in your Supabase SQL Editor</li>
              </ul>
            </p>
          </div>
        ) : (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p className="font-bold">✅ Connection Successful!</p>
            <p className="mt-2">
              Found {questionSets?.length || 0} question sets in the database.
            </p>
            <p className="mt-2 text-sm">
              This is expected - the database is empty until you seed it with data.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}


