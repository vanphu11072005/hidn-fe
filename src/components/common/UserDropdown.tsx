'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, ChevronDown, Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function UserDropdown() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render if not authenticated or loading
  if (status === 'loading' || !session?.user) {
    return null;
  }

  const user = session.user;
  const displayName = user.name || user.email || 'User';
  const email = user.email || '';
  
  // Get first letter for avatar fallback
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-2 py-1.5 
          rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors 
          focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:ring-offset-1"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full overflow-hidden 
          bg-gradient-to-br from-blue-500 to-blue-600 
          flex items-center justify-center text-white 
          font-semibold text-xs shadow-sm">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{avatarLetter}</span>
          )}
        </div>

        {/* Name */}
        <span className="text-sm font-medium 
          text-primary dark:text-white max-w-[120px] truncate">
          {displayName}
        </span>

        {/* Chevron */}
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 dark:text-gray-300 transition-transform 
            ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white 
          dark:bg-gray-800 rounded-lg shadow-lg border 
          border-gray-200 dark:border-gray-700 py-1 z-50 
          animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100 
            dark:border-gray-700">
            <p className="text-sm font-semibold text-primary 
              dark:text-gray-100 truncate">
              {displayName}
            </p>
            {email && (
              <p className="text-xs text-gray-500 
                dark:text-gray-400 truncate mt-0.5">
                {email}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Admin switch - only for admin users */}
            {(user as any)?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm
                  text-gray-700 dark:text-gray-300 hover:bg-gray-50
                  dark:hover:bg-gray-700 transition-colors group"
              >
                <Shield className="w-4 h-4 mr-3 text-gray-400
                  dark:text-gray-500 group-hover:text-blue-600
                  dark:group-hover:text-blue-400" />
                <span className="group-hover:text-primary
                  dark:group-hover:text-gray-100">
                  Quản trị viên
                </span>
              </Link>
            )}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-2.5 text-sm 
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 
                dark:hover:bg-gray-700 transition-colors group"
            >
              <User className="w-4 h-4 mr-3 text-gray-400 
                dark:text-gray-500 group-hover:text-blue-600 
                dark:group-hover:text-blue-400" />
              <span className="group-hover:text-primary 
                dark:group-hover:text-gray-100">
                Thông tin cá nhân
              </span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="w-full flex items-center px-4 py-2.5 
                text-sm text-gray-700 dark:text-gray-300 
                hover:bg-gray-50 dark:hover:bg-gray-700 
                transition-colors group"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 mr-3 text-gray-400 
                    dark:text-gray-500 group-hover:text-blue-600 
                    dark:group-hover:text-blue-400" />
                  <span className="group-hover:text-primary 
                    dark:group-hover:text-gray-100">
                    Chế độ tối
                  </span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 mr-3 text-gray-400 
                    dark:text-gray-500 group-hover:text-yellow-500" />
                  <span className="group-hover:text-primary 
                    dark:group-hover:text-gray-100">
                    Chế độ sáng
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 
                text-sm text-gray-700 dark:text-gray-300 
                hover:bg-red-50 dark:hover:bg-red-900/20 
                transition-colors group"
            >
              <LogOut className="w-4 h-4 mr-3 text-gray-400 
                dark:text-gray-500 group-hover:text-red-600 
                dark:group-hover:text-red-400" />
              <span className="group-hover:text-red-600 
                dark:group-hover:text-red-400">
                Đăng xuất
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
