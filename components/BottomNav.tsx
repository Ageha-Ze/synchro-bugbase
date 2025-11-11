"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FolderKanban } from "lucide-react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function BottomNav() {
  const path = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser;
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    // biar toast muncul dulu
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  useEffect(() => {
    router.prefetch("/dashboard");
    router.prefetch("/projects");
  }, [router]);

  const isActive = (route: string) =>
    path === route
      ? "text-indigo-600 dark:text-indigo-400"
      : "text-gray-600 dark:text-gray-300";

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-t border-gray-200 dark:border-neutral-800 shadow-lg z-50">
      <div className="flex flex-col items-center justify-center py-1">
        {/* Label dan logo */}
        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-100 text-xs font-semibold mb-1">
          <img
            src="https://static.thenounproject.com/png/bug-tracking-icon-2119186-512.png"
            alt="Bug Tracking Icon"
            className="w-4 h-4"
          />
          <span>Synchro BugBase</span>
        </div>

        {/* Tombol navigasi */}
        <div className="flex justify-around w-full pb-1">
          {/* Dashboard */}
          <button
            onClick={() => router.push("/dashboard")}
            className={`flex flex-col items-center ${isActive("/dashboard")} hover:text-indigo-600`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </button>

          {/* Projects */}
          <button
            onClick={() => router.push("/projects")}
            className={`flex flex-col items-center ${isActive("/projects")} hover:text-indigo-600`}
          >
            <FolderKanban className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Projects</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{loading ? "..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
