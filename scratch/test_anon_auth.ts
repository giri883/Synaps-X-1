import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAnon() {
  const { supabase } = await import('../src/supabaseClient');
  console.log('Testing signInAnonymously...');
  const { data, error } = await supabase.auth.signInAnonymously();
  console.log('Result:', { user: data.user?.id, session: Boolean(data.session), error: error?.message });
}

testAnon();
