import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LogOut, User, ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useAuth } from "@/lib/auth";
import NotificationDropdown from "@/components/NotificationDropdown";
import NotificationBar from "@/components/NotificationBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userName: string;
  userRole: string;
  sidebarItems: (
    | { type?: string; label: string }
    | { icon: IconDefinition; label: string; path?: string; active?: boolean; children?: { label: string; path: string }[] }
  )[];
}

const DashboardLayout = ({
  children,
  title,
  userName,
  userRole,
  sidebarItems,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { logout } = useAuth();
  // Start with sidebar open on large screens and closed on small screens
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024; // match Tailwind's lg breakpoint
  });

  useEffect(() => {
    // Update sidebar visibility if the window is resized across the lg breakpoint
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    // auto-expand parents that contain the active child
    sidebarItems.forEach((it: any) => {
      const key = it.path ?? it.label;
      if (it.children && Array.isArray(it.children)) {
        const hasActiveChild = it.children.some((c: any) => c.path === pathname);
        map[key] = !!hasActiveChild;
      }
    });
    return map;
  });

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Notification Bar */}
      <NotificationBar />
      
      {/* Top Navigation Bar - Fixed */}
      <header className="bg-slate-800 border-b z-50 shadow-xl h-[72px] flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-4 h-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white hover:bg-slate-700"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">EduManage</h1>
                <p className="text-xs text-gray-300">{title}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 hover:bg-slate-700 text-white">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold">{userName}</p>
                    <p className="text-xs text-gray-300">{userRole}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area - Flex Row */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:static lg:translate-x-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 transition-transform duration-300 shadow-xl h-full lg:flex-shrink-0`}
          role="navigation"
          aria-label="Main sidebar"
        >
          <nav className="p-4 space-y-1.5 overflow-y-auto h-full">
            {sidebarItems.map((item: any, index: number) => {
              // Section heading
              if (item.type === 'section') {
                return (
                  <div key={index} className="px-2 pt-4 pb-1">
                    <div className="text-xs text-gray-400 uppercase font-semibold">{item.label}</div>
                  </div>
                );
              }

              // Regular item
              const key = item.path ?? item.label;
              const isExpanded = !!expanded[key];
              return (
                <div key={index}>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 h-11 text-sm font-medium transition-all ${
                        item.active 
                          ? "bg-slate-700 text-white shadow-sm" 
                          : "text-gray-300 hover:bg-slate-700 hover:text-white"
                      }`}
                      onClick={() => item.path && navigate(item.path)}
                    >
                      {item.icon ? <FontAwesomeIcon icon={item.icon} className="w-5 h-5" /> : <span className="w-5" />}
                      <span>{item.label}</span>
                    </Button>

                    {item.children && Array.isArray(item.children) && item.children.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
                        }}
                        aria-label={isExpanded ? 'Collapse submenu' : 'Expand submenu'}
                        className="ml-2 p-2 rounded hover:bg-slate-700 text-gray-400 hidden lg:inline-block"
                      >
                        <ChevronRight className={`w-4 h-4 transform ${isExpanded ? 'rotate-90 text-white' : ''}`} />
                      </button>
                    )}
                  </div>

                  {item.children && Array.isArray(item.children) && isExpanded && (
                    <div className="pl-8 mt-1 space-y-1">
                      {item.children.map((child: any, ci: number) => (
                        <Button
                          key={ci}
                          variant={child.path === pathname ? "secondary" : "ghost"}
                          className={`w-full justify-start gap-3 h-9 text-sm font-normal transition-all ${
                            child.path === pathname
                              ? "bg-slate-700 text-white shadow-sm"
                              : "text-gray-400 hover:bg-slate-700 hover:text-white"
                          }`}
                          onClick={() => child.path && navigate(child.path)}
                        >
                          <span className="w-2 h-2 rounded-full bg-sky-400 mr-3" />
                          <span>{child.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
