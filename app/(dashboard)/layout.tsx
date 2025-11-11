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
    <div className="w-full">
      <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 dark:text-gray-100 leading-relaxed break-words">
        Hi, Partner — {timeData.greeting}! Today is {timeData.date}. Hope your day is great!
      </p>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-neutral-950 dark:text-gray-100 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-screen w-60 md:w-64 transform bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-neutral-800 shadow-xl transition-transform duration-500 ease-in-out z-40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0`}
        >
          <Sidebar />
        </aside>

        {/* Overlay (mobile only) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 ease-in-out">
          {/* Header */}
          <header className="min-h-[64px] py-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 flex flex-wrap items-start sm:items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Hamburger (mobile only) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 md:hidden transition-all"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Greeting */}
            <div className="flex-1 min-w-0">
              <DynamicGreeting />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 lg:px-10 overflow-y-auto transition-all duration-300 ease-in-out">
            {children}
          </main>

          {/* Footer */}
          <footer className="h-12 border-t flex items-center justify-center text-sm text-gray-500 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md">
            © {new Date().getFullYear()} Synchron Testing · All rights reserved
          </footer>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </ProtectedRoute>
  );
}