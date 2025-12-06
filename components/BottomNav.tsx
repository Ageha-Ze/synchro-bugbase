"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FolderKanban, Bug, Sun, Moon, BarChart3, User } from "lucide-react"; // ✅ Tambah User
import supabaseBrowser from "@/lib/supabaseBrowser";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // ⭐ INI YANG BENAR
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);

    if (error) {
      toast({
        title: "Logout Gagal",
        description: error.message,
        type: "error",
      });
      return;
    }

    toast({
      title: "Berhasil Logout",
      description: "Kamu telah keluar dari akun.",
    });

    setTimeout(() => router.push("/login"), 1000);
  };

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/projects");
    router.prefetch("/all-bugs");
    router.prefetch("/reports");
    router.prefetch("/profile"); // ✅ Tambah prefetch profile
  }, [router]);

  const isActive = (route: string) =>
    path === route
      ? "text-indigo-600 dark:text-indigo-400"
      : "text-gray-600 dark:text-gray-300";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-t border-gray-200 dark:border-gray-700 flex flex-col items-center">

      {/* Aksi Theme + Logout */}
      <div className="w-full px-4 mt-2 pb-2 border-b border-gray-200 dark:border-gray-700 flex gap-2 justify-center">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
          text-gray-700 dark:text-gray-200 
          bg-gray-100 dark:bg-gray-800
          hover:bg-gray-200 dark:hover:bg-gray-700
          transition-all duration-300"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold
          text-red-600 dark:text-red-400
          hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500
          hover:text-white dark:hover:text-white
          transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          {loading ? "..." : "Logout"}
        </button>
      </div>

      {/* Title */}
      <div className="font-semibold text-sm py-1 text-indigo-600 dark:text-indigo-400">
        Synchro BugBase
      </div>

      {/* Navigation - ✅ Sekarang 5 items */}
      <div className="flex justify-around w-full pb-1">

        <Link href="/dashboard" className={`flex flex-col items-center ${isActive("/dashboard")} hover:text-indigo-600 dark:hover:text-indigo-400`}>
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </Link>

        <Link href="/projects" className={`flex flex-col items-center ${isActive("/projects")} hover:text-indigo-600 dark:hover:text-indigo-400`}>
          <FolderKanban className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Projects</span>
        </Link>

        <Link href="/all-bugs" className={`flex flex-col items-center ${isActive("/all-bugs")} hover:text-indigo-600 dark:hover:text-indigo-400`}>
          <Bug className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">All Bugs</span>
        </Link>

        <Link href="/reports" className={`flex flex-col items-center ${isActive("/reports")} hover:text-indigo-600 dark:hover:text-indigo-400`}>
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Reports</span>
        </Link>

        {/* ✅ TOMBOL PROFILE BARU */}
        <Link href="/profile" className={`flex flex-col items-center ${isActive("/profile")} hover:text-indigo-600 dark:hover:text-indigo-400`}>
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>

      </div>
    </nav>
  );
}