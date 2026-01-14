'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, UserDropdown } from '@/components/common';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Zap } from 'lucide-react';

interface HeaderProps {
  showAuth?: boolean;
  onMenuClick?: () => void;
}

export function Header({ showAuth = false, onMenuClick }: HeaderProps) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-60 bg-white/80 backdrop-blur-sm
      text-primary dark:bg-[#212121]/80 dark:text-gray-200">
      <div className="relative z-60 w-full px-6 sm:pl-7 lg:pl-9 py-1">
        <div className="flex items-center justify-between">
          {/* Left group - flush left */}
          <div className="flex items-center">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 
                  dark:hover:bg-white/5 transition-colors mr-2"
                aria-label="Open menu"
              >
                <svg 
                  className="w-6 h-6 text-gray-700 dark:text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
            )}

            <span className="text-lg font-medium text-[#0D0D0D] dark:text-white">
              Hidn
            </span>
          </div>

          {/* Right group - flush right */}
          <div className="flex items-center space-x-2">
            

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-1.5">
                    <Zap className="w-4 h-4 text-[#7fb0ff]" />
                    <span className="text-sm font-medium text-[#0D0D0D] dark:text-white">
                      {user.credits.totalCredits} credits
                    </span>
                  </div>

                  <UserDropdown />
                </>
              ) : showAuth ? (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Đăng ký
                    </Button>
                  </Link>
                </>
              ) : null}
            </div>

            {/* Right-side mobile menu removed (we use left hamburger to open sidebar) */}
          </div>
        </div>
        
      </div>

      {/* Left inset, right flush bottom border (reduced left inset) */}
      <div className="ml-3 sm:ml-4 lg:ml-5 mr-0 border-b border-gray-200
        dark:border-white/10" />
    </header>
  );
}
