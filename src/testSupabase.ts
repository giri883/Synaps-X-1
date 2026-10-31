import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
    console.log("Testing Supabase connection to:", process.env.VITE_SUPABASE_URL);
    const { data, error } = await supabase
        .from("apps")
        .select("id, name, category")
        .limit(5);

    if (error) {
        console.error("Supabase connection failed:", error.message);
        return;
    }

    console.log("Supabase connection succeeded:", data);
}

// Auto-run if executed directly
testSupabaseConnection();
