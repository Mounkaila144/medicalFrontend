"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  title: string;
  href: string;
  roles?: string[];
}

export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = user?.role || "guest";
  
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      roles: ["admin", "doctor", "receptionist", "nurse"],
    },
    {
      title: "Appointments",
      href: "/appointments",
      roles: ["admin", "doctor", "receptionist", "nurse"],
    },
    {
      title: "Patients",
      href: "/patients",
      roles: ["admin", "doctor", "receptionist", "nurse"],
    },
    {
      title: "Practitioners",
      href: "/practitioners",
      roles: ["admin"],
    },
    {
      title: "Medical Records",
      href: "/medical-records",
      roles: ["admin", "doctor", "nurse"],
    },
    {
      title: "Billing",
      href: "/billing",
      roles: ["admin", "receptionist"],
    },
    {
      title: "Reports",
      href: "/reports",
      roles: ["admin"],
    },
    {
      title: "Users",
      href: "/users",
      roles: ["admin"],
    },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6 overflow-x-auto hide-scrollbar">
      {filteredItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
            pathname.startsWith(item.href)
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}