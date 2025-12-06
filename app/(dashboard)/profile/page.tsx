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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileClient
          profile={profile}
          userId={user.id}
          userEmail={user.email ?? ""}
        />
      </div>
    </div>
  );
}
