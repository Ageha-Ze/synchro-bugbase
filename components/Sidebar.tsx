"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FolderKanban, Bug, BarChart3, Settings, Bell, Sun, Moon } from "lucide-react";
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
        .from("activities" as any) // ✅ Tambah as any
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to real-time updates
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

    // Tunggu sebentar biar toast sempat muncul
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/projects");
    router.prefetch("/all-bugs"); // ✅ Tambah ini
    router.prefetch("/reports"); // ✅ Tambah ini
  }, [router]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

return (

  <nav className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto">

  {/* Navigasi */}
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
      <span className="ml-1.5 truncate">Bugs</span>
    </Link>

    <Link href="/reports" className={`${linkClass("/reports")} group`}>
      <BarChart3 className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
      <span className="ml-1.5 truncate">Reports</span>
    </Link>
  </div>

  {/* ---------- Tombol Aksi (Theme + Logout) ---------- */}
  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col space-y-2">

    {/* Toggle Theme */}
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold 
      text-gray-700 dark:text-gray-200 
      bg-gray-100 dark:bg-gray-800
      hover:bg-gray-200 dark:hover:bg-gray-700
      transition-all duration-300"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
      <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
    </button>

    {/* Logout */}
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
      text-red-600 dark:text-red-400
      hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500
      hover:text-white dark:hover:text-white
      transition-all duration-300"
    >
      <LogOut className="w-5 h-5" />
      {loading ? "Logging out..." : "Logout"}
    </button>
  </div>
</nav>

    {/* Responsif Mobile */}
    <style jsx>{`
      @media (max-width: 768px) {
        aside {
          position: fixed;
          bottom: 0;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: end;
          border-top: 1px solid #e5e7eb;
          background-color: #ffffff;
          z-index: 50;
          padding: 1rem;
        }
        :global(.dark aside) {
          background-color: #111827;
          border-color: #374151;
        }

        nav {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          overflow-x: auto;
          flex: 1;
        }

        nav a,
        nav button {
          white-space: nowrap;
          flex-shrink: 0;
          font-size: 0.8rem;
          padding: 0.5rem 0.75rem;
        }
      }
    `}</style>
  </aside>
);
}