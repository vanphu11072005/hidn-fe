'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Home,
  FileText,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  CreditCard,
  History,
  PanelLeft,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Tổng quan',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: Home },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { label: 'AI tóm tắt', href: '/tools/summary', 
        icon: FileText },
      { label: 'AI câu hỏi', href: '/tools/questions', 
        icon: HelpCircle },
      { label: 'AI giải thích', href: '/tools/explain', 
        icon: Lightbulb },
      { label: 'AI viết lại', href: '/tools/rewrite', 
        icon: RefreshCw },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      { label: 'Lịch sử', href: '/history', icon: History },
      { label: 'Credits', href: '/credits', icon: CreditCard },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      collapsed ? '4rem' : '16rem'
    );
  }, [collapsed]);

  const base = [
    collapsed ? 'w-16' : 'w-64',
    'bg-gray-50 dark:bg-[#181818]',
    'border-r border-gray-100 dark:border-white/5',
    'h-full transition-all duration-300',
  ].join(' ');

  // If `open` prop is provided, render as overlay drawer (for mobile)
  if (typeof open === 'boolean') {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/40 z-60 transition-opacity ${
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-70 transform transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          } ${base} w-64`}
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <img src="/logo.svg" alt="Hidn logo" className="h-6 w-auto invert dark:invert-0" />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg
              hover:bg-gray-200 dark:hover:bg-white/5 transition text-gray-500 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="px-2 space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                {/* Section Title */}
                <div className="px-3 mb-2">
                  <h3 className="text-sm font-light text-gray-400 
                    dark:text-gray-300 tracking-wider">
                    {section.title}
                  </h3>
                </div>

                {/* Section Items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href || 
                      pathname.startsWith(item.href + '/');

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative flex items-center transition-all group px-3 py-2 mx-1 space-x-3 rounded-lg ${
                          isActive
                            ? 'bg-gray-100 dark:bg-white/10'
                            : 'hover:bg-gray-100/80 dark:hover:bg-white/5'
                        } text-primary dark:text-white`}
                        onClick={onClose}
                      >
                        {isActive && (
                          <div className="absolute left-0 w-1 h-5 bg-gray-900 dark:bg-white rounded-r-full" />
                        )}
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                        <span className="text-sm font-light">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  return (
    <aside
      className={`${base} ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center">
              <div className="p-1.5 rounded-lg">
                <img src="/logo.svg" alt="Hidn logo" className="h-6 w-auto invert dark:invert-0" />
              </div>
            </Link>

            <button
              onClick={() => setCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
              hover:bg-gray-200 dark:hover:bg-white/5 transition text-gray-500 dark:text-gray-400"
            >
                <PanelLeft className="w-4.5 h-4.5" />
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="relative w-8 h-8 rounded-lg group flex items-center justify-center"
            >
              <div className="p-1 rounded-lg transition-opacity group-hover:opacity-0">
                <img src="/logo.svg" alt="Hidn logo" className="h-6 w-auto invert dark:invert-0" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center
              rounded-lg bg-gray-200 dark:bg-white/10
              opacity-0 group-hover:opacity-100 transition">
                <PanelLeft className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`${collapsed ? 'px-0' : 'px-2'} 
        ${collapsed ? 'space-y-1' : 'space-y-4'}`}>
        {navSections.map((section) => (
          <div key={section.title}>
            {/* Section Title - only show when not collapsed */}
                {!collapsed && (
              <div className="px-3 mb-2">
                <h3 className="text-sm font-light text-gray-400 dark:text-gray-300 tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}

            {/* Section Items */}
            <div className={collapsed ? 'space-y-1' : 'space-y-0.5'}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                        className={`relative flex items-center transition-all group ${
                      collapsed
                        ? 'justify-center w-10 h-10 mx-auto rounded-lg'
                        : 'px-3 py-2 mx-1 space-x-3 rounded-lg'
                    } ${
                      isActive 
                        ? 'bg-gray-100 dark:bg-white/10' 
                        : 'hover:bg-gray-100/80 dark:hover:bg-white/5'
                    } text-primary dark:text-white`}
                  >
                    {/* Left Indicator */}
                    {isActive && !collapsed && (
                      <div className="absolute left-0 w-1 h-5 bg-gray-900 dark:bg-white rounded-r-full" />
                    )}

                    <div className={collapsed ? 'flex items-center justify-center' : ''}>
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    {!collapsed && (
                      <span className="text-sm font-light">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
