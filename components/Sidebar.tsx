'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react';
import Link from 'next/link';
import supabaseBrowser from '@/lib/supabaseBrowser';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser;
  const [loading, setLoading] = useState(false);

  const linkClass = (route: string) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer
    ${
      path === route
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm scale-[1.02]'
        : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600'
    }`;

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) return alert(error.message);
    router.push('/login');
  };

  useEffect(() => {
    router.prefetch('/dashboard');
    router.prefetch('/projects');
  }, [router]);

  return (
    <aside className="w-64 bg-white border-r border-indigo-100 flex flex-col shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-indigo-100 bg-gradient-to-r from-indigo-500 to-red-400">
        <div className="relative">
          <img
        src="https://static.thenounproject.com/png/bug-tracking-icon-2119186-512.png"
        alt="Bug Tracking Icon"
        className="w-10 h-10 transition-transform hover:scale-125"
      />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span> </div>
        <span className="font-extrabold text-lg text-white tracking-tight">
          Synchro BugBase
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/dashboard" className={`${linkClass('/dashboard')} group`}>
          <LayoutDashboard className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
          <span className="ml-1.5">Dashboard</span>
        </Link>

        <Link href="/projects" className={`${linkClass('/projects')} group`}>
          <FolderKanban className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
          <span className="ml-1.5">Projects</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-100">
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 w-full justify-center text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 font-semibold py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <style jsx>{`
        aside {
          animation: fadeInSidebar 0.4s ease-in-out;
        }
        @keyframes fadeInSidebar {
          from {
            opacity: 0;
            transform: translateX(-16px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          aside {
            position: fixed;
            width: 100%;
            height: auto;
            bottom: 0;
            top: auto;
            flex-direction: row;
            border-top: 1px solid #e5e7eb;
            border-right: none;
            background: white;
            z-index: 50;
          }
          nav {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            padding: 0.5rem 0;
          }
          .p-4.border-t {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
