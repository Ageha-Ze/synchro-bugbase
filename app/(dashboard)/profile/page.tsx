// app/(dashboard)/profile/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

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
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <ProfileClient profile={profile} userId={user.id} userEmail={user.email || ""} />
    </div>
  );
}
