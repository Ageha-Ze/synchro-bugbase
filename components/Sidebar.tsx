'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Database, Bug, BarChart3, FolderKanban,
  ChevronDown, ChevronUp, Plus, LogOut, User,
  ChevronRight, ChevronLeft, Bell,
} from 'lucide-react';
import Link from 'next/link';
import supabaseBrowser from '@/lib/supabaseBrowser';
import { useToast } from '@/components/ui/use-toast';

interface MenuItem {
  id: string;
  name: string;
  icon: any;
  href?: string;
  badge?: string | number;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'projects', name: 'Projects', icon: FolderKanban, href: '/projects' },
  {
    id: 'bugs',
    name: 'Bug Tracking',
    icon: Bug,
    submenu: [
      { id: 'all-bugs', name: 'All Bugs', icon: Bug, href: '/all-bugs', badge: '12' },
      { id: 'new-bug', name: 'Create Bug', icon: Plus, href: '/projects' },
    ],
  },
  { id: 'reports', name: 'Reports', icon: BarChart3, href: '/reports' },
  { id: 'profile', name: 'Profile', icon: User, href: '/profile' },
];

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser;
  const { toast } = useToast();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine if sidebar should be expanded
  const shouldBeExpanded = isMobile ? isExpanded : (isExpanded || isHovered);

  // Auto-open menu if current page is in submenu
  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu) {
        const isActive = item.submenu.some((sub) => pathname === sub.href);
        if (isActive && !openMenus.includes(item.id)) {
          setOpenMenus((prev) => [...prev, item.id]);
        }
      }
    });
  }, [pathname]);

  const toggleMenu = (menuId: string) => {
    setOpenMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout Success",
        description: "You have been logged out.",
      });

      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
      });
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl border-r border-gray-200 z-50 transition-all duration-300 ease-in-out ${
          shouldBeExpanded ? 'w-80' : 'w-16'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
              <Bug className="w-4 h-4 text-white" />
            </div>
            {shouldBeExpanded && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold text-gray-900">Synchro BugBase</h1>
                <p className="text-xs text-gray-500">Bug Tracking System</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button - Only visible on mobile */}
        {isMobile && (
          <div className="px-3 py-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center justify-center"
              title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
            >
              {isExpanded ? (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
          <div className="px-4 mb-4">
            {shouldBeExpanded && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Navigation
              </p>
            )}
          </div>

          <div className="space-y-0.5 px-3">
            {menuItems.map((item) => (
              <div key={item.id}>
                {item.submenu ? (
                  <div>
                    {shouldBeExpanded ? (
                      <button
                        onClick={() => toggleMenu(item.id)}
                        className={`group w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-150 ${
                          openMenus.includes(item.id)
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
                          <span className="text-sm font-normal truncate">{item.name}</span>
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            openMenus.includes(item.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    ) : (
                      <button
                        onClick={() => isMobile && setIsExpanded(true)}
                        className="group w-full flex items-center justify-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150 relative"
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      </button>
                    )}

                    {openMenus.includes(item.id) && shouldBeExpanded && (
                      <div className="mt-1 space-y-0.5">
                        {item.submenu.map((sub) => (
                          sub.href ? (
                            <Link
                              key={sub.id}
                              href={sub.href}
                              onClick={() => isMobile && setIsExpanded(false)}
                              className={`group flex items-center justify-between pl-9 pr-3 py-2 text-sm rounded-md transition-all duration-150 ${
                                pathname === sub.href
                                  ? 'bg-indigo-900 text-white font-medium'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-0.5'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <sub.icon className="w-4 h-4 transition-transform duration-150 group-hover:scale-110" />
                                <span className="truncate">{sub.name}</span>
                              </div>
                              {sub.badge && (
                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full min-w-[18px] text-center">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ) : null
                        ))}
                      </div>
                    )}
                  </div>
                ) : item.href ? (
                  shouldBeExpanded ? (
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsExpanded(false)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-md transition-all duration-150 ${
                      pathname === item.href
                        ? 'bg-indigo-900 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
                      <span className="text-sm font-normal truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded-full min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className="group flex items-center justify-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-150 relative"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    </Link>
                  )
                ) : null}
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-100">
          {shouldBeExpanded ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Bug Tracker</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop blur overlay when sidebar is expanded on mobile */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        ></div>
      )}
    </>
  );
}
