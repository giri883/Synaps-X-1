import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkTables() {
  const { supabase } = await import('../src/supabaseClient');
  const candidateTables = [
    'profiles',
    'tasks',
    'subtasks',
    'favourites',
    'favorites',
    'conversations',
    'messages',
    'ai_conversations',
    'ai_messages',
    'notifications',
    'user_preferences',
    'preferences',
    'expenses',
    'expense_tracking_periods',
    'expense_transactions',
    'tracking_periods',
    'apps'
  ];

  console.log('--- CHECKING EXISTING SUPABASE TABLES ---');
  for (const t of candidateTables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (!error) {
      console.log(`[EXISTS] Table "${t}": Query successful (rows: ${data?.length})`);
    } else {
      console.log(`[MISSING / ERROR] Table "${t}": ${error.message} (code: ${error.code})`);
    }
  }
}

checkTables();
