import { createClient, SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://wymimlxswyxgeynggsag.supabase.co";
const DEFAULT_SUPABASE_KEY = "sb_publishable_jIW-D6I4xnVKZqUu-4SlVw_ii-6OQ3w";
const DEFAULT_JWT_KEY = "84ce2843-074b-4481-af75-cb465ba85590";

function getEnvVar(key: string, fallback = ""): string {
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any)?.env?.[key]) {
      return (import.meta as any).env[key];
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== "undefined" && process?.env?.[key]) {
      return process.env[key] || fallback;
    }
  } catch {
    // ignore
  }
  return fallback;
}

const supabaseUrl = getEnvVar("VITE_SUPABASE_URL", DEFAULT_SUPABASE_URL);
const supabasePublishableKey =
  getEnvVar("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  getEnvVar("VITE_SUPABASE_ANON_KEY", DEFAULT_SUPABASE_KEY);

export const supabasePublicJwtKey = getEnvVar("VITE_SUPABASE_PUBLIC_JWT_KEY", DEFAULT_JWT_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes("your-project-ref") &&
  !supabaseUrl.includes("placeholder")
);

export const supabase: SupabaseClient = createClient(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabasePublishableKey || DEFAULT_SUPABASE_KEY
);
