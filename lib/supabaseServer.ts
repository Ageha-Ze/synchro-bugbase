// lib/supabaseServer.ts
import { createServerClient } from "@supabase/ssr";
import { Cookie } from "next-cookie";
import type { Database } from "@/types/supabase";

export function supabaseServer() {
  let cookieStore: any;

  try {
    // ✅ Production / server-side environment
    cookieStore = new Cookie();
  } catch {
    // 🧩 Localhost / dev fallback
    cookieStore = {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    };
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get?.(name);
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set?.(name, value, options);
          } catch {
            /* ignore dev mode */
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.remove?.(name, options);
          } catch {
            /* ignore dev mode */
          }
        },
      },
    }
  );
}
