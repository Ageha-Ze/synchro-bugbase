"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FolderKanban, Bug, BarChart3, Sun, Moon, User } from "lucide-react";
import Link from "next/link";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "next-themes";

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser;
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const linkClass = (route: string) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer
    ${
      path === route
        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm scale-[1.02]"
        : "text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white dark:hover:from-indigo-700 dark:hover:to-purple-700"
    }`;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from("activities" as any)
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    const channel = supabase
      .channel("activities_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      type: "success",
    });

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/projects");
    router.prefetch("/all-bugs");
    router.prefetch("/reports");
    router.prefetch("/profile");
  }, [router]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col bg-white dark:bg-gray-900 border-r border-indigo-100 dark:border-gray-800 shadow-sm fixed left-0 top-0 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-indigo-100 dark:border-gray-800 bg-gradient-to-r from-indigo-500 to-red-400 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="relative">
          <img
            src="https://static.thenounproject.com/png/bug-tracking-icon-2119186-512.png"
            alt="Bug Tracking Icon"
            className="w-9 h-9 transition-transform hover:scale-125"
          />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        </div>
        <span className="font-extrabold text-lg text-white tracking-tight">Synchro BugBase</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
        {/* Main Navigation */}
        <div className="flex flex-col space-y-2">
          <Link href="/dashboard" className={`${linkClass("/dashboard")} group`}>
            <LayoutDashboard className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">Dashboard</span>
          </Link>

          <Link href="/projects" className={`${linkClass("/projects")} group`}>
            <FolderKanban className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">Projects</span>
          </Link>

          <Link href="/all-bugs" className={`${linkClass("/all-bugs")} group`}>
            <Bug className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">All Bugs</span>
          </Link>

          <Link href="/reports" className={`${linkClass("/reports")} group`}>
            <BarChart3 className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">Reports</span>
          </Link>
        </div>

        {/* Spacer - Push items below to bottom */}
        <div className="flex-1"></div>

        {/* Bottom Items */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href="/profile" className={`${linkClass("/profile")} group`}>
            <User className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">Profile</span>
          </Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition-all duration-300"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            <span className="ml-1.5">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-3 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-1.5">{loading ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}