import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testExistingUsers() {
  const { supabase } = await import('../src/supabaseClient');
  const emails = [
    'girisaran370@gmail.com',
    'student@university.edu',
    'alex.morgan@university.edu',
    'priya.sharma@campus.ac.in',
  ];

  for (const email of emails) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'student123',
    });
    console.log(`Email "${email}" with "student123":`, {
      user: data.user?.id,
      error: error?.message,
    });
  }
}

testExistingUsers();
