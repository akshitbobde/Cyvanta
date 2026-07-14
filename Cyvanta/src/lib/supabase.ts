import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured with real values
export const isSupabaseConfigured = !!(
  rawUrl && 
  rawKey && 
  rawUrl.startsWith("https://") && 
  rawUrl !== "https://your-project-url.supabase.co"
);

// We use a valid URL format for the client even if not configured to prevent startup crashes
const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://placeholder-service.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? (rawKey as string) : "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type { User } from "@supabase/supabase-js";
