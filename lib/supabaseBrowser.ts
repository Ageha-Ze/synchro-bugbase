// lib/supabaseBrowser.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env variables");
}

// ✅ BENAR: Pakai createBrowserClient dari @supabase/ssr
export const createBrowserSupabaseClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// ✅ Export default untuk backward compatibility
const supabaseBrowser = createBrowserSupabaseClient();
export default supabaseBrowser;