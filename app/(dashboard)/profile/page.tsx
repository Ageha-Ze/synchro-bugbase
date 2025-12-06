// app/(dashboard)/profile/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export default async function ProfilePage() {
  const supabase = await supabaseServer();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
<div className="max-w-screen-xl mx-auto px-1 py-10">

    <ProfileClient
      profile={profile}
      userId={user.id}
      userEmail={user.email ?? ""}
    />
  </div>

  );
}