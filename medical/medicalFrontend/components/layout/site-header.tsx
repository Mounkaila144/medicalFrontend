"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { MainNav } from "@/components/layout/main-nav";
import { useAuth } from "@/hooks/useAuth";
import { Stethoscope } from "lucide-react";

export default function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  
  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl hidden sm:inline-block">MediSync</span>
        </Link>
        
        {isAuthenticated ? (
          <>
            <MainNav />
            <div className="ml-auto flex items-center space-x-4">
              <ModeToggle />
              <UserNav user={user} />
            </div>
          </>
        ) : (
          <>
            <div className="ml-auto flex items-center space-x-4">
              <ModeToggle />
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}