import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

function signJwt(payload: any, secret: string): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');
  return `${b64Header}.${b64Payload}.${signature}`;
}

async function testJwt() {
  const url = process.env.VITE_SUPABASE_URL!;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
  const jwtSecret = process.env.VITE_SUPABASE_PUBLIC_JWT_KEY!;

  const userId = '881ea185-bf35-4dfc-9f7e-ffa0f3f9a143';
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    sub: userId,
    email: 'student.synapse@gmail.com',
    role: 'authenticated',
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: 'Test Student' },
  };

  const token = signJwt(payload, jwtSecret);
  console.log('Generated token:', token.slice(0, 40) + '...');

  const client = createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  console.log('Testing tasks query with token...');
  const { data: tasks, error: tasksError } = await client
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  console.log('Tasks result with JWT:', { count: tasks?.length, error: tasksError?.message });

  // Test profiles query
  const { data: profiles, error: profileError } = await client
    .from('profiles')
    .select('*');

  console.log('Profiles result with JWT:', { count: profiles?.length, error: profileError?.message });

  // Test inserting a task
  const { data: insertData, error: insertError } = await client
    .from('tasks')
    .insert({
      id: crypto.randomUUID(),
      user_id: userId,
      title: 'Authenticated Test Task',
      description: 'Testing RLS',
      status: 'pending',
      priority: 'high',
    })
    .select();

  console.log('Task insert with JWT:', { data: insertData, error: insertError?.message });
}

testJwt();
