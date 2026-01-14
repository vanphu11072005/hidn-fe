'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerified?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireVerified = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      // Not logged in - redirect to login
      if (!user) {
        router.push('/login');
        return;
      }

      // Email not verified - redirect to verify-email
      // (except if already on verify-email page)
      if (requireVerified && !user.emailVerified && 
          pathname !== '/verify-email') {
        router.push('/verify-email');
      }
    }
  }, [user, loading, router, pathname, requireVerified]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center 
        justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 
            border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If no user, don't render (will redirect)
  if (!user) {
    return null;
  }

  // If email verification required but not verified
  if (requireVerified && !user.emailVerified && 
      pathname !== '/verify-email') {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
