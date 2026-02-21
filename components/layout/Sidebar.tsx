"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  BarChart3,
  Settings,
  User,
  LogOut,
  Fuel,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: string[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "MANAGER", "DRIVER"],
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: Truck,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: Users,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Trips",
    href: "/trips",
    icon: Route,
    allowedRoles: ["ADMIN", "MANAGER", "DRIVER"],
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    allowedRoles: ["ADMIN", "MANAGER"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    allowedRoles: ["ADMIN"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();

  const visibleItems = navItems.filter(
    (item) => currentUser && item.allowedRoles.includes(currentUser.role)
  );

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-900 text-white">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">FleetFlow</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center space-x-3 mb-3">
          {currentUser?.avatar && (
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser?.role || "DRIVER"}</p>
          </div>
        </div>
        <Link
          href="/profile"
          className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center space-x-1"
        >
          <User className="w-3 h-3" />
          <span>View Profile</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4 space-y-2">
        <Button
          onClick={logout}
          variant="outline"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
