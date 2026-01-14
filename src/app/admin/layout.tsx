'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wand2,
  FileText,
  LogOut,
  ChevronLeft,
  Menu,
  Settings,
  Shield,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
      exact: false,
    },
    {
      href: '/admin/credits',
      label: 'Credits',
      icon: CreditCard,
      exact: true,
    },
    {
      href: '/admin/credits/config',
      label: 'Credit Config',
      icon: CreditCard,
      exact: false,
    },
    {
      href: '/admin/ai-tools',
      label: 'Tool Analytics',
      icon: Wand2,
      exact: true,
    },
    {
      href: '/admin/ai-tools/config',
      label: 'Tool Config',
      icon: Settings,
      exact: false,
    },
    {
      href: '/admin/security',
      label: 'Security',
      icon: Shield,
      exact: false,
    },
    {
      href: '/admin/logs',
      label: 'Logs',
      icon: FileText,
      exact: false,
    },
  ];

  useEffect(() => {
    // Skip check for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    // Check if user has admin role
    const userRole = (session?.user as any)?.role;
    if (status === 'authenticated' && userRole !== 'admin') {
      const url = new URL('/admin/login', window.location.origin);
      url.searchParams.set('error', 'unauthorized');
      router.push(url.toString());
      return;
    }

    setLoading(false);
  }, [session, status, router, pathname]);

  // Show loading for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth
  if (loading || status === 'loading') {
    return (
      <div 
        className="
          min-h-screen flex items-center justify-center 
          bg-slate-950
        "
      >
        <div className="text-center">
          <div 
            className="
              w-16 h-16 border-4 border-blue-500 
              border-t-transparent rounded-full 
              animate-spin mx-auto mb-4
            "
          />
          <p className="text-slate-400">Đang kiểm tra quyền...</p>
        </div>
      </div>
    );
  }

  // Admin authenticated - show admin layout
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-slate-900 
          border-r border-slate-800 
          transition-all duration-300 z-40
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Sidebar Header */}
        <div 
          className="
            h-16 flex items-center justify-between 
            px-4 border-b border-slate-800
          "
        >
          {!sidebarCollapsed && (
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3"
            >
              <div 
                className="
                  w-8 h-8 bg-gradient-to-br 
                  from-blue-500 to-purple-600 
                  rounded-lg flex items-center 
                  justify-center
                "
              >
                <Image
                  src="/logo.svg"
                  alt="HIDN"
                  width={20}
                  height={20}
                  className="invert"
                />
              </div>
              <span 
                className="
                  text-sm font-bold text-white
                "
              >
                HIDN Admin
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="
              p-1.5 hover:bg-slate-800 rounded-lg 
              transition-colors
            "
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronLeft 
                className="w-5 h-5 text-slate-400" 
              />
            )}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 
                  rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white ' +
                        'hover:bg-slate-800'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Logout */}
        <div 
          className="
            absolute bottom-0 left-0 right-0 
            p-3 border-t border-slate-800
          "
        >
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`
              flex items-center gap-3 w-full px-3 py-2.5 
              text-slate-400 hover:text-red-400 
              hover:bg-slate-800 rounded-lg transition-colors
              ${sidebarCollapsed ? 'justify-center' : ''}
            `}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`
          flex-1 transition-all duration-300
          ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
        `}
      >
        {/* Header */}
        <header 
          className="
            h-16 bg-slate-900/50 border-b 
            border-slate-800 sticky top-0 z-30 
            backdrop-blur-sm
          "
        >
          <div 
            className="
              h-full px-6 flex items-center 
              justify-between
            "
          >
            <div>
              <h1 
                className="
                  text-lg font-semibold text-white
                "
              >
                Admin Portal
              </h1>
              <p className="text-xs text-slate-400">
                Khu vực quản trị hệ thống
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
