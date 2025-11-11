'use client';

import ProtectedRoute from '@/lib/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

function DynamicGreeting() {
  const [timeData, setTimeData] = useState({ greeting: '', date: '' });

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hours = now.getHours();

      let greeting = '';
      if (hours < 12) greeting = 'Good morning';
      else if (hours < 18) greeting = 'Good afternoon';
      else greeting = 'Good night';

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const date = `${day}-${month}-${year}`;

      setTimeData({ greeting, date });
    };

    updateGreeting();
    const timer = setInterval(updateGreeting, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 dark:text-gray-100 truncate">
      Hi, Partner, {timeData.greeting}! Now is {timeData.date}, hope your day is great!
    </h1>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-56 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl border-r border-gray-200 dark:border-neutral-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
        >
          <Sidebar />
        </aside>

        {/* Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px] md:hidden z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main area */}
        <div className="flex-1 flex flex-col md:ml-56 transition-all duration-300 overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 md:hidden transition-all"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <DynamicGreeting />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 w-full max-w-full overflow-auto px-4 sm:px-6 py-4">
            <div className="w-full h-full max-w-screen-2xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="h-12 border-t border-gray-200 dark:border-neutral-800 flex items-center justify-center text-sm text-gray-500 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md">
            © {new Date().getFullYear()} Synchron Testing · All rights reserved
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
}