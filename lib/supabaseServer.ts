// lib/supabaseServer.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export function createServerSupabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      auth: {
        getItem: async (key: string) => {
          try {
            const c = await cookieStore.get(key); // ✅ tambahkan await
            return c?.value ?? null;
          } catch {
            return null;
          }
        },
        setItem: async (key: string, value: string) => {
          // implementasi sesuai kebutuhan
        },
        removeItem: async (key: string) => {
          // implementasi sesuai kebutuhan
        },
      },
    }
  );
}
