"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

interface Profile {
  id: string;
  full_name: string | null;
  role: "QA" | "Developer" | "Manager" | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ProfileClientProps {
  profile: Profile | null;
  userId: string;
  userEmail: string;
}

export default function ProfileClient({ profile, userId, userEmail }: ProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully!");

      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Top Profile Header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <CardContent className="relative -mt-12 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 shadow-md overflow-hidden">
            <Image
              src={profile?.avatar_url || "/default-avatar.png"}
              alt="Avatar"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>

          <h2 className="mt-4 text-xl font-semibold">
            {profile?.full_name || "No Name Set"}
          </h2>

          <p className="text-sm text-muted-foreground capitalize">
            {profile?.role || "User"}
          </p>
        </CardContent>
      </Card>


      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">

          <form onSubmit={handleUpdateProfile} className="space-y-5">

            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={userEmail} disabled className="bg-muted/40" />
            </div>

            <div className="space-y-1">
              <Label>Role</Label>
              <Input
                value={profile?.role || "user"}
                disabled
                className="capitalize bg-muted/40"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>

          </form>
        </CardContent>
      </Card>


      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Information about your account</CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>User ID</span>
            <span className="text-right">{userId}</span>
          </div>

          <div className="flex justify-between">
            <span>Account Created</span>
            <span>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
