'use client';

import { useEffect, useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';

import ProtectedRoute from '@/lib/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

function DynamicGreeting() {
  const [timeData, setTimeData] = useState({ greeting: '', date: '', icon: '🌅' });

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hours = now.getHours();

      let greeting = '';
      let icon = '';

      if (hours < 12) {
        greeting = 'Good morning';
        icon = '🌅';
      } else if (hours < 18) {
        greeting = 'Good afternoon';
        icon = '☀️';
      } else {
        greeting = 'Good night';
        icon = '🌙';
      }

      const date = `${String(now.getDate()).padStart(2, '0')}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${now.getFullYear()}`;

      setTimeData({ greeting, date, icon });
    };

    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGradientClass = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'from-amber-600 via-orange-600 to-pink-600';
    if (hours < 18) return 'from-blue-600 via-cyan-600 to-teal-600';
    return 'from-indigo-600 via-purple-600 to-pink-600';
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl hidden sm:inline animate-pulse">{timeData.icon}</span>
      <h1
        className={`
          text-sm sm:text-base md:text-lg font-bold
          bg-gradient-to-r ${getGradientClass()} bg-clip-text text-transparent
          truncate md:whitespace-nowrap
          [@media(max-width:768px)]:whitespace-normal
          [@media(max-width:768px)]:leading-snug
        `}
      >
        Hi, Partner, {timeData.greeting}! Now is {timeData.date}, hope your day is
        great!
      </h1>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('[data-sidebar]');
      const toggleButton = document.querySelector('[data-sidebar-toggle]');
      
      // Check if click is outside sidebar and not on toggle button
      if (
        sidebarExpanded &&
        sidebar &&
        !sidebar.contains(target) &&
        toggleButton &&
        !toggleButton.contains(target)
      ) {
        setSidebarExpanded(false);
      }
    };

    if (sidebarExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarExpanded]);

  // Sidebar always starts collapsed (no auto-expand)
  // User must manually expand it

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-purple-950/20 dark:to-neutral-950 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block" data-sidebar>
          <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />
        </div>

        {/* Main area - Fixed positioning, no margin shift */}
        <div
          className="flex flex-col flex-1 h-screen overflow-hidden fixed inset-y-0 right-0 transition-all duration-300"
          style={{
            left: isMobile ? 0 : '64px',
            width: isMobile ? '100%' : 'calc(100% - 64px)'
          }}
        >
          {/* Topbar with colorful gradient border */}
          <header className="relative h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b-2 border-transparent bg-clip-padding flex items-center justify-between px-4 sm:px-6 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30 sticky top-0 z-20">
            {/* Gradient border effect */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5 pointer-events-none"></div>
            
            <div className="relative flex items-center gap-3 flex-1">
              {/* Sidebar toggle (desktop) */}
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hidden md:flex p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                title={sidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
                data-sidebar-toggle
              >
                {sidebarExpanded ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5" />
                )}
              </button>

              {/* Hamburger (mobile) */}
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 md:hidden transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                data-sidebar-toggle
              >
                <Menu className="w-5 h-5" />
              </button>

              <DynamicGreeting />
            </div>

            {/* Sparkle decoration */}
            <div className="relative hidden lg:flex">
              <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
            </div>
          </header>

          {/* Scrollable content with subtle pattern */}
          <main className="relative flex-1 p-4 sm:p-6 pb-20 overflow-y-auto">
            {/* Subtle decorative background pattern */}
            <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,rgb(209,213,219)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(55,65,81)_1px,transparent_0)] bg-[size:40px_40px]"></div>
            
            <div className="relative z-10">
              {children}
            </div>
          </main>

          {/* Footer with gradient */}
          <footer className="relative h-12 border-t-2 border-transparent bg-clip-padding bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-center text-sm font-medium md:mb-0 mb-16 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/30">
            {/* Gradient border effect */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
            
            <div className="relative flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent font-bold">
                © {new Date().getFullYear()} Synchron Testing
              </span>
              <span className="text-gray-400 dark:text-gray-500">·</span>
              <span className="text-gray-500 dark:text-gray-400">All rights reserved</span>
            </div>
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