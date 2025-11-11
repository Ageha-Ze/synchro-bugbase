"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, FolderKanban, LogOut } from "lucide-react";
import supabaseBrowser from "@/lib/supabaseBrowser";
import { useState } from "react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = supabaseBrowser;
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      alert("Error signing out: " + error.message);
    } else {
      router.push("/login");
    }
  };

  // Fungsi bantu buat tanda aktif
  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-t border-gray-200 dark:border-neutral-800 shadow-md z-50">
      <div className="flex flex-col items-center justify-center py-1">
        {/* Logo kecil */}
        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-100 text-xs font-semibold mb-1">
          <span className="text-blue-600 text-sm">🌀</span>
          <span>Synchro BugBase</span>
        </div>

        {/* Bar navigasi */}
        <div className="flex justify-around w-full pb-1">
          <button
            onClick={() => router.push("/dashboard")}
            className={`flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${
              isActive("/dashboard") ? "text-blue-600 dark:text-blue-400" : ""
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/project")}
            className={`flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 ${
              isActive("/dashboard/project")
                ? "text-blue-600 dark:text-blue-400"
                : ""
            }`}
          >
            <FolderKanban className="w-5 h-5" />
            <span className="text-[10px]">Project</span>
          </button>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px]">
              {loading ? "..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
