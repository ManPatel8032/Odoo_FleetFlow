"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, User, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function TopBar() {
  const { currentUser } = useAuth();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    const segments = path.split("/").filter(Boolean);
    if (!segments[0]) return "Dashboard";
    
    const titleMap: Record<string, string> = {
      dashboard: "Dashboard",
      vehicles: "Vehicle Registry",
      drivers: "Driver Management",
      trips: "Trip Dispatcher",
      maintenance: "Maintenance Scheduler",
      analytics: "Analytics & Reports",
      settings: "Settings",
      profile: "User Profile",
    };
    
    return titleMap[segments[0]] || "Dashboard";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-300";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "driver":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left side - Page title */}
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-900">{getPageTitle(pathname)}</h2>
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-6">
        {/* Help Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-600 hover:text-gray-900"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* User Info */}
        <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
          {currentUser?.avatar && (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
            <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(currentUser?.role || "driver")}`}>
              {ROLE_LABELS[currentUser?.role || "driver"]}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
