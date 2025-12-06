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

  Save,
  Loader2,
  Phone,
  FileText,
  Camera,
  Sparkles
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
    setLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ 
          full_name: fullName,
          bio: bio,
          phone: phone,
          avatar_url: avatarUrl
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved."
      });

      setAvatarFile(null);

    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error.message || "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string | null | undefined) => {
    const roleConfig: Record<string, { gradient: string; icon: string; shadow: string }> = {
      QA: { 
        gradient: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white", 
        icon: "🔍",
        shadow: "shadow-lg shadow-blue-500/30"
      },
      Developer: { 
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", 
        icon: "💻",
        shadow: "shadow-lg shadow-purple-500/30"
      },
      Manager: { 
        gradient: "bg-gradient-to-r from-green-500 to-emerald-500 text-white", 
        icon: "👔",
        shadow: "shadow-lg shadow-green-500/30"
      },
    };

    const config = roleConfig[role || ""] || { 
      gradient: "bg-gradient-to-r from-gray-500 to-slate-500 text-white", 
      icon: "👤",
      shadow: "shadow-lg shadow-gray-500/30"
    };

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold ${config.gradient} ${config.shadow} transform hover:scale-105 transition-all duration-200`}>
        <span className="text-lg">{config.icon}</span>
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 text-gray-900 dark:text-gray-100 transition-all">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative max-w-5xl mx-auto p-4 md:p-8 space-y-8">

          {/* PROFILE HEADER – Colorful Gradient */}
          <Card className="border-0 bg-white dark:bg-gray-800/50 shadow-2xl shadow-purple-500/20 backdrop-blur-sm overflow-hidden [&>*]:rounded-none rounded-none">
            {/* Gradient Top Bar */}
            <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
            
            <CardContent className="p-8 -mt-16">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

                {/* AVATAR with Gradient Border */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-800 bg-white">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        className="w-32 h-32 object-cover"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-4xl font-bold">
                        {getInitials(profile?.full_name)}
                      </div>
                    )}
                  </div>
                </div>

                {/* PROFILE INFO */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {profile?.full_name || "No Name Set"}
                  </h1>

                  <div className="mt-3 flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 mr-2 text-purple-500" />
                    <span className="font-medium">{userEmail}</span>
                  </div>

                  <div className="mt-4">
                    {getRoleBadge(profile?.role)}
                  </div>
                </div>

                <Sparkles className="hidden sm:block w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* LAYOUT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* MAIN FORM – Colorful */}
            <Card className="lg:col-span-2 border-0 bg-white dark:bg-gray-800/50 shadow-xl backdrop-blur-sm rounded-none">
              <CardHeader className="border-b border-purple-100 dark:border-purple-900/30 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-none">
                <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  <User className="w-6 h-6 text-purple-600" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Update your profile details and make it shine! ✨
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                <div className="space-y-6">

                  {/* AVATAR UPLOAD with Gradient */}
                  <div className="space-y-3">
                    <Label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Camera className="w-5 h-5 text-purple-500" />
                      Profile Picture
                    </Label>

                    <div className="flex items-center gap-5 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 blur opacity-50 group-hover:opacity-75 transition"></div>
                        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white ring-2 ring-purple-500">
                        {avatarPreview ? (
                          <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar preview" />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                            {getInitials(fullName)}
                          </div>
                        )}
                      </div>
                      </div>

                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {/* EMAIL with Icon */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email
                    </Label>
                    <Input
                      value={userEmail}
                      disabled
                      className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 text-gray-700 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500">🔒 Email cannot be changed</p>
                  </div>

                  {/* ROLE with Icon */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Role
                    </Label>
                    <Input
                      value={profile?.role || "User"}
                      disabled
                      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 font-medium"
                    />
                  </div>

                  {/* FULL NAME */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-500" />
                      Full Name
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-700 focus:ring-2 focus:ring-purple-500 px-4 py-2"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* PHONE */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-500" />
                      Phone
                    </Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white dark:bg-gray-900 border-orange-300 dark:border-orange-700 focus:ring-2 focus:ring-orange-500 px-4 py-2"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* BIO */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-200 font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pink-500" />
                      Bio
                    </Label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border-pink-300 dark:border-pink-700 focus:ring-2 focus:ring-pink-500 px-4 py-3 resize-none"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* SAVE BUTTON with Gradient */}
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={loading} 
                    className="w-full py-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-bold text-lg shadow-xl shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* RIGHT SIDEBAR – Colorful Cards */}
            <div className="space-y-6">
              <Card className="border-0 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-500/30 rounded-none">
                <CardHeader>
                  <CardTitle className="text-white font-bold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Account Details
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-blue-100 mb-2">User ID</p>
                    <code className="block text-xs bg-white/20 backdrop-blur-sm p-3 border border-white/30 font-mono break-all">
                      {userId}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-xs font-semibold text-blue-100">Account Created</p>
                      <p className="text-sm font-bold">{formatDate(profile?.created_at)}</p>
                    </div>
                  </div>

                  {profile?.updated_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <div>
                        <p className="text-xs font-semibold text-blue-100">Last Updated</p>
                        <p className="text-sm font-bold">{formatDate(profile?.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fun Stats Card */}
              <Card className="border-0 bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-500/30 rounded-none">
                <CardHeader>
                  <CardTitle className="text-white font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completeness</span>
                      <span className="font-bold text-lg">
                        {[fullName, bio, phone, avatarPreview].filter(Boolean).length * 25}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 h-3 overflow-hidden">
                      <div 
                        className="bg-white h-full transition-all duration-500"
                        style={{width: `${[fullName, bio, phone, avatarPreview].filter(Boolean).length * 25}%`}}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ClientConnectionHandler>
  );
}