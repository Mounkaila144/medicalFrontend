'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Breadcrumbs } from './breadcrumbs';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Don't show layout on auth pages and home page
  if (pathname?.startsWith('/auth/') || pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      
      {/* Main content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "lg:ml-64" // Always show sidebar on large screens
      )}>
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs />
        </div>
        
        {/* Page content */}
        <main className="px-4 sm:px-6 lg:px-8 pb-8">
          {children}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
} 