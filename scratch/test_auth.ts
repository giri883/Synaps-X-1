import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAuth() {
  const { supabase } = await import('../src/supabaseClient');
  
  const testEmail = `student.synapse.${Date.now().toString().slice(-6)}@gmail.com`;
  const testPass = 'Password123!';

  console.log('Testing SignUp for:', testEmail);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPass,
    options: {
      data: {
        full_name: 'Test Student',
      }
    }
  });

  if (signUpError) {
    console.error('SignUp Error:', signUpError.message);
  } else {
    console.log('SignUp Success! User ID:', signUpData.user?.id);
    console.log('Session present:', Boolean(signUpData.session));
  }

  // Now test SignIn
  console.log('\nTesting SignIn...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (signInError) {
    console.error('SignIn Error:', signInError.message);
  } else {
    console.log('SignIn Success! Authenticated User ID:', signInData.user?.id);
    console.log('Access token present:', Boolean(signInData.session?.access_token));

    // Now test reading tasks with authenticated client!
    console.log('\nTesting authenticated tasks query...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', signInData.user.id);

    console.log('Tasks result with authenticated user:', { count: tasks?.length, error: tasksError?.message });

    // Test inserting a task
    console.log('\nTesting task insert with authenticated user...');
    const { data: insertedTask, error: insertError } = await supabase
      .from('tasks')
      .insert({
        user_id: signInData.user.id,
        title: 'Complete Math Assignment',
        description: 'Chapter 4 problems 1-10',
        status: 'pending',
        priority: 'high',
      })
      .select();

    console.log('Insert task result:', { inserted: insertedTask, error: insertError?.message });

    // Test signing out
    await supabase.auth.signOut();
    console.log('\nSigned out successfully.');
  }
}

testAuth();
