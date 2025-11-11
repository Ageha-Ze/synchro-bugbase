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
    <aside className="h-screen w-64 flex flex-col bg-white border-r border-indigo-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-500 to-red-400">
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

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col p-4 space-y-2 overflow-y-auto">
        <div className="flex flex-col space-y-2">
          <Link href="/dashboard" className={`${linkClass('/dashboard')} group`}>
            <LayoutDashboard className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">Dashboard</span>
          </Link>

          <Link href="/projects" className={`${linkClass('/projects')} group`}>
            <FolderKanban className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
            <span className="ml-1.5 truncate">Projects</span>
          </Link>
        </div>

        {/* Logout button selalu di bawah */}
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-2 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 font-semibold py-2 px-4 rounded-lg transition-all duration-300 w-full mt-auto"
        >
          <LogOut className="w-5 h-5" />
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </nav>

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

  /* === DESKTOP === */
  @media (min-width: 769px) {
    aside {
      position: relative;
      height: 100vh;
      width: 16rem;
      display: flex;
      flex-direction: column;
      background: white;
      border-right: 1px solid #e0e7ff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }
  }

  /* === MOBILE === */
  @media (max-width: 768px) {
    aside {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      width: 100%;
      background: white;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 50;
      padding: 0 0.5rem;
    }

    /* sembunyikan header di mobile */
    aside > div:first-child {
      display: none;
    }

    nav {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      overflow-x: auto;
      gap: 0.5rem;
      padding: 0;
    }

    nav a,
    nav button {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      padding: 0.25rem;
      border-radius: 8px;
      background: transparent;
    }

    nav a span,
    nav button span {
      display: none; /* sembunyikan text di mobile */
    }

    nav svg {
      width: 22px;
      height: 22px;
    }

    /* ikon logout di kanan */
    nav button {
      color: #ef4444;
    }
  }
      `}</style>
    </aside>
  );
}
