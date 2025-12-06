"use server";

import { supabaseServer } from "@/lib/supabaseServer";

export async function loginAction({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { success: false, message: error.message };

  return { success: true };
}
