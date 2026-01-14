"use client";

import { useState } from 'react';
import { Header, Sidebar } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        {/* Mobile sidebar overlay - shown on small screens only */}
        <div className="md:hidden">
          <Sidebar 
            open={mobileSidebarOpen} 
            onClose={() => setMobileSidebarOpen(false)} 
          />
        </div>

        {/* Desktop sidebar - fixed left on md+ screens, full height */}
        <div className="hidden md:block md:fixed md:inset-y-0 md:left-0 md:-mt-1.5">
          <Sidebar />
        </div>

        {/* Right column: header + main + footer. Use CSS variable so the
          right column margin updates when sidebar collapses. On small
          screens we don't apply a left margin so content spans full width. */}
        <div className="min-h-screen flex flex-col md:ml-[var(--sidebar-width)]">
          {/* Header inside right column */}
          <Header 
            showAuth={false} 
            onMenuClick={() => setMobileSidebarOpen(true)}
          />

          {/* Main content area */}
          <main className="flex-1 p-6 sm:px-7 lg:px-9 bg-white dark:bg-[#212121] overflow-auto">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
