'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';

import ProtectedRoute from '@/lib/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

function DynamicGreeting() {
  const [timeData, setTimeData] = useState({ greeting: '', date: '' });

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hours = now.getHours();

      const greeting =
        hours < 12
          ? 'Good morning'
          : hours < 18
          ? 'Good afternoon'
          : 'Good night';

      const date = `${String(now.getDate()).padStart(2, '0')}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${now.getFullYear()}`;

      setTimeData({ greeting, date });
    };

    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <h1
      className="
        text-sm sm:text-base md:text-lg font-semibold 
        text-gray-700 dark:text-gray-100
        truncate md:whitespace-nowrap
        [@media(max-width:768px)]:whitespace-normal
        [@media(max-width:768px)]:leading-snug
      "
    >
      Hi, Partner, {timeData.greeting}! Now is {timeData.date}, hope your day is
      great!
    </h1>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-neutral-800 shadow-xl z-40 overflow-hidden">
          <Sidebar />
        </aside>

        {/* Main area */}
        <div className="flex flex-col flex-1 md:ml-64 h-screen overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-3">
              {/* Hamburger (mobile) */}
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 md:hidden">
                <Menu className="w-6 h-6" />
              </button>

              <DynamicGreeting />
            </div>
          </header>

          {/* Scrollable content */}
          <main className="flex-1 p-4 sm:p-6 pb-20 overflow-y-auto">
            {children}
          </main>

          {/* Footer */}
          <footer className="h-12 border-t border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md flex items-center justify-center text-sm text-gray-500 md:mb-0 mb-16">
            © {new Date().getFullYear()} Synchron Testing · All rights reserved
          </footer>
        </div>

        {/* Mobile bottom navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </ProtectedRoute>
  );
}
