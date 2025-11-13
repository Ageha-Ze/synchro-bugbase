
"use client";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FolderKanban, Bug } from "lucide-react";
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
    variant: "destructive",
  });
  return;
}

toast({
  title: "Berhasil Logout",
  description: "Kamu telah keluar dari akun.",
});

// biar toast muncul dulu
setTimeout(() => {
  router.push("/login");
}, 1000);
};
useEffect(() => {
router.prefetch("/dashboard");
router.prefetch("/projects");
router.prefetch("/all-bugs");
}, [router]);
const isActive = (route: string) =>
path === route
? "text-indigo-600 dark:text-indigo-400"
: "text-gray-600 dark:text-gray-300";
return (


{/* Label dan logo */}

  <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md border-t border-gray-200 dark:border-gray-700">
    <div className="flex flex-col items-center">
      {/* Label dan logo */}
      <div className="font-semibold text-sm py-1 text-indigo-600 dark:text-indigo-400">
        Synchro BugBase
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

      {/* All Bugs */}
      <button
        onClick={() => router.push("/all-bugs")}
        className={`flex flex-col items-center ${isActive("/all-bugs")} hover:text-indigo-600`}
      >
        <Bug className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">All Bugs</span>
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="flex flex-col items-center text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{loading ? "..." : "Logout"}</span>
      </button>
    </div>
  </div>
</nav>
);
}