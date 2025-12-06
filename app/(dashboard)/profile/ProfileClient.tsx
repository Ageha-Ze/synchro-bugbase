"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ClientConnectionHandler from "@/components/ClientConnectionHandler";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Clock, 
  IdCard,
  Save,
  Loader2,
  Phone,
  FileText,
  Camera
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  role: "QA" | "Developer" | "Manager" | null;
  created_at: string | null;
  updated_at: string | null;
  bio?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

interface ProfileClientProps {
  profile: Profile | null;
  userId: string;
  userEmail: string;
}

export default function ProfileClient({ profile, userId, userEmail }: ProfileClientProps) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

  // ✅ Sync state dengan props saat profile berubah
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setAvatarPreview(profile.avatar_url || null);
    }
  }, [profile]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image under 5MB"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Please select an image file"
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
const handleUpdateProfile = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log("🔥 Function called!"); // ✅ Tambah ini
  console.log("Data:", { fullName, bio, phone }); // ✅ Tambah ini
  setLoading(true);

  try {
    let avatarUrl = profile?.avatar_url;

    if (avatarFile) {
      console.log("📸 Uploading avatar..."); // ✅ Tambah ini
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError); // ✅ Tambah ini
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      avatarUrl = publicUrl;
      console.log("✅ Avatar uploaded:", avatarUrl); // ✅ Tambah ini
    }

    console.log("💾 Updating profile..."); // ✅ Tambah ini
    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: fullName,
        bio: bio,
        phone: phone,
        avatar_url: avatarUrl
      })
      .eq("id", userId);

    if (error) {
      console.error("❌ Update error:", error); // ✅ Tambah ini
      throw error;
    }

    console.log("✅ Profile updated successfully!"); // ✅ Tambah ini
    toast.success("Profile updated successfully!", {
      description: "Your changes have been saved."
    });

    setAvatarFile(null);

  } catch (error: any) {
    console.error("❌ Catch error:", error); // ✅ Tambah ini
    toast.error("Failed to update profile", {
      description: error.message || "Please try again later."
    });
  } finally {
    setLoading(false);
    console.log("🏁 Function completed"); // ✅ Tambah ini
  }
};
  // Helper functions sama seperti sebelumnya...
  const getRoleBadge = (role: string | null | undefined) => {
    const roleConfig: Record<string, { color: string; icon: string }> = {
      QA: { color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", icon: "🔍" },
      Developer: { color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800", icon: "💻" },
      Manager: { color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800", icon: "👔" },
    };

    const config = roleConfig[role || ""] || { 
      color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800", 
      icon: "👤" 
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${config.color}`}>
        <span>{config.icon}</span>
        {role || "User"}
      </span>
    );
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

return (
  <ClientConnectionHandler>
    <div className="min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 transition-all">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">

        {/* PROFILE HEADER – GitHub Style */}
        <Card className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0d1117]">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* AVATAR */}
              <div className="relative">
                <div className="rounded-full overflow-hidden border border-gray-300 dark:border-gray-700">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      className="w-32 h-32 object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-4xl font-semibold">
                      {getInitials(profile?.full_name)}
                    </div>
                  )}
                </div>
              </div>

              {/* PROFILE INFO */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile?.full_name || "No Name Set"}
                </h1>

                <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  {userEmail}
                </div>

                <div className="mt-4">
                  {getRoleBadge(profile?.role)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* MAIN FORM – GitHub Clean */}
          <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0d1117]">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d1117] rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Update your profile details
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              <form onSubmit={handleUpdateProfile} className="space-y-8">

                {/* AVATAR UPLOAD */}
                <div className="space-y-3">
                  <Label className="font-medium text-gray-700 dark:text-gray-300">
                    Profile Picture
                  </Label>

                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                      {avatarPreview ? (
                        <img src={avatarPreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xl">
                          {getInitials(fullName)}
                        </div>
                      )}
                    </div>

                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="bg-white dark:bg-[#0d1117] border-gray-300 dark:border-gray-700 px-3 py-2 text-sm rounded-md"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Email</Label>
                  <Input
                    value={userEmail}
                    disabled
                    className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* ROLE */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Role</Label>
                  <Input
                    value={profile?.role || "User"}
                    disabled
                    className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  />
                </div>

                {/* FULL NAME */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-white dark:bg-[#0d1117] border-gray-300 dark:border-gray-700 px-3 py-2 rounded-md"
                  />
                </div>

                {/* PHONE */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white dark:bg-[#0d1117] border-gray-300 dark:border-gray-700 px-3 py-2 rounded-md"
                  />
                </div>

                {/* BIO */}
                <div className="space-y-2">
                  <Label className="text-gray-700 dark:text-gray-300">Bio</Label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-white dark:bg-[#0d1117] border-gray-300 dark:border-gray-700 px-3 py-2 rounded-md"
                    rows={4}
                  />
                </div>

                {/* SAVE BUTTON */}
                <Button type="submit" disabled={loading} className="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700">
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* RIGHT SIDEBAR – GitHub Style */}
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#0d1117]">
              <CardHeader className="border-b border-gray-200 dark:border-gray-800">
                <CardTitle className="text-gray-900 dark:text-white">Account Details</CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-600">User ID</p>
                  <code className="block text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                    {userId}
                  </code>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-600">Account Created</p>
                  <p className="text-sm font-medium">{formatDate(profile?.created_at)}</p>
                </div>

                {profile?.updated_at && (
                  <div>
                    <p className="text-xs font-medium text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(profile?.updated_at)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </ClientConnectionHandler>
);
}