'use client'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import supabaseBrowser from '@/lib/supabaseBrowser'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const path = usePathname()
  const router = useRouter()
  const supabase = supabaseBrowser
  const [loading, setLoading] = useState(false)

  const linkClass = (route: string) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 cursor-pointer ${
      path === route
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-[1.03]'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-neutral-800 dark:hover:to-neutral-800 hover:text-indigo-600'
    }`

  const handleLogout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)
    if (error) return alert(error.message)
    router.push('/login')
  }

  useEffect(() => {
    router.prefetch('/dashboard')
    router.prefetch('/projects')
  }, [router])

  return (
    <aside className="w-64 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-r border-gray-200 dark:border-neutral-800 flex flex-col shadow-xl rounded-r-3xl transition-all duration-500">
  {/* Header */}
  <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-neutral-800">
    <div className="relative">
      <img
        src="https://static.thenounproject.com/png/bug-tracking-icon-2119186-512.png"
        alt="Bug Tracking Icon"
        className="w-10 h-10 transition-transform hover:scale-125"
      />
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
    </div>
    <span className="font-extrabold text-lg text-gray-900 dark:text-gray-100 tracking-tight">
      Synchro Bug Base
    </span>
  </div>

  {/* Navigation */}
  <nav className="flex-1 p-4 space-y-3">
    <Link
      href="/dashboard"
      className={`${linkClass('/dashboard')} group relative overflow-hidden`}
    >
      <LayoutDashboard className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
      <span className="ml-2">Dashboard</span>
      {/* subtle hover shine */}
      <span className="absolute -top-1 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none rounded-xl"></span>
    </Link>
    <Link
      href="/projects"
      className={`${linkClass('/projects')} group relative overflow-hidden`}
    >
      <FolderKanban className="w-5 h-5 transition-transform group-hover:rotate-[20deg]" />
      <span className="ml-2">Projects</span>
      <span className="absolute -top-1 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none rounded-xl"></span>
    </Link>
  </nav>

  {/* Footer */}
  <div className="p-4 border-t border-gray-200 dark:border-neutral-800">
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 w-full justify-center text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 dark:text-red-400 font-semibold py-2 rounded-xl shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  </div>

  <style jsx>{`
    aside {
      animation: fadeInSidebar 0.5s ease-in-out;
    }
    @keyframes fadeInSidebar {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `}</style>
</aside>

  )
}
