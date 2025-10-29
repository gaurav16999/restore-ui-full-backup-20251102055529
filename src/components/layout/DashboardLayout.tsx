import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, LogOut, User } from "lucide-react";
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
  sidebarItems: {
    icon: IconDefinition;
    label: string;
    path?: string;
    active?: boolean;
  }[];
}

const DashboardLayout = ({
  children,
  title,
  userName,
  userRole,
  sidebarItems,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Bar */}
      <NotificationBar />
      
      {/* Top Navigation Bar */}
      <header className="bg-slate-800 border-b sticky top-0 z-40 shadow-xl">
        <div className="flex items-center justify-between px-4 py-4">
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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } fixed lg:static lg:translate-x-0 inset-y-0 left-0 z-40 w-64 bg-slate-800 border-r border-slate-700 transition-transform duration-300 mt-[81px] lg:mt-0 shadow-xl`}
        >
          <nav className="p-4 space-y-1.5 h-full overflow-y-auto">
            {sidebarItems.map((item, index) => {
              return (
                <Button
                  key={index}
                  variant={item.active ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 text-sm font-medium transition-all ${
                    item.active 
                      ? "bg-slate-700 text-white shadow-sm" 
                      : "text-gray-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  onClick={() => item.path && navigate(item.path)}
                >
                  <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
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
        <main className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
