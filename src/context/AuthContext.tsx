'use client';

import React, { 
  createContext, 
  useContext, 
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { authService } from '@/services/auth';
import { walletService } from '@/services/wallet';
import type { 
  User, 
  LoginRequest, 
  RegisterRequest 
} from '@/types/auth.types';
import type { ApiError } from '@/types/common.types';

interface UserCredits {
  freeCredits: number;
  paidCredits: number;
  totalCredits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    token: string, 
    password: string
  ) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { data: session, status, update } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<UserCredits>({
    freeCredits: 0,
    paidCredits: 0,
    totalCredits: 0,
  });
  const router = useRouter();

  // Fetch credits when session is available
  const fetchCredits = useCallback(async () => {
    if (!session?.user) {
      console.log('[AuthContext] No session user, skipping credit fetch');
      return;
    }
    
    console.log('[AuthContext] Fetching credits for user:', {
      userId: session.user.id,
      email: session.user.email,
      hasAccessToken: !!(session as any).accessToken
    });
    
    try {
      const wallet = await walletService.getWallet();
      console.log('[AuthContext] Credits fetched successfully:', wallet);
      setCredits({
        freeCredits: wallet.freeCredits,
        paidCredits: wallet.paidCredits,
        totalCredits: wallet.totalCredits,
      });
    } catch (err: any) {
      // If it's a 401/403, session expired - don't spam logs
      if (err?.statusCode === 401 || err?.statusCode === 403) {
        console.warn('Session expired, please login again');
        // Optionally trigger logout
        return;
      }
      
      // Better error logging with fallbacks
      console.error('Failed to fetch credits:', {
        message: err?.message || err?.toString() || 'Unknown error',
        statusCode: err?.statusCode || 'No status code',
        error: err?.error || 'No error details',
        fullError: err,
        isApiError: err?.success === false,
      });
      
      // Set credits to 0 on error to prevent stale data
      setCredits({
        freeCredits: 0,
        paidCredits: 0,
        totalCredits: 0,
      });
    }
  }, [session?.user]);

  // Fetch credits on session change
  useEffect(() => {
    if (session?.user) {
      // Check if session has an error (e.g., token refresh failed)
      if ((session as any).error === 'RefreshAccessTokenError') {
        console.warn('Session expired, redirecting to login...');
        // Clear session and redirect
        signOut({ callbackUrl: '/login' });
        return;
      }
      fetchCredits();
    }
  }, [session?.user, fetchCredits]);

  // Map NextAuth session to User type
  const user: User | null = session?.user ? {
    id: parseInt(session.user.id || '0'),
    email: session.user.email || '',
    emailVerified: true, // Assume verified if in session
    role: 'user',
    profile: {
      displayName: null,
      avatarUrl: null,
    },
    credits,
    createdAt: new Date().toISOString(),
  } : null;

  const loading = status === 'loading';

  const login = async (data: LoginRequest) => {
    try {
      setError(null);

      // Use NextAuth signIn with credentials
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Get callbackUrl from URL params, default to dashboard
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get('callbackUrl') || '/dashboard';
      
      router.push(callbackUrl);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Đăng nhập thất bại');
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setError(null);

      // Register via backend API
      const response = await authService.register(data);
      
      // Check if email is already verified (Google account linking)
      if (response.emailVerified) {
        // Auto-login and go to dashboard
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push('/dashboard');
      } else {
        // Redirect to verify email page
        router.push('/verify-email');
      }
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Đăng ký thất bại');
      throw err;
    }
  };

  const logout = async () => {
    try {
      // Sign out from NextAuth
      await signOut({ redirect: false });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshUser = async () => {
    try {
      // Trigger NextAuth session update
      await update();
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const refreshCredits = async () => {
    try {
      // Fetch latest wallet info from backend
      const wallet = await walletService.getWallet();
      
      // Update credits state
      setCredits({
        freeCredits: wallet.freeCredits,
        paidCredits: wallet.paidCredits,
        totalCredits: wallet.totalCredits,
      });
    } catch (err: any) {
      console.error('Refresh credits error:', {
        message: err?.message || err?.toString() || 'Unknown error',
        statusCode: err?.statusCode,
        fullError: err,
      });
      
      // Set credits to 0 on error
      setCredits({
        freeCredits: 0,
        paidCredits: 0,
        totalCredits: 0,
      });
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      setError(null);
      await authService.verifyEmail(code);
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Xác thực thất bại');
      throw err;
    }
  };

  const resendVerification = async () => {
    try {
      setError(null);
      await authService.resendVerification();
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Không thể gửi lại mã');
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await authService.forgotPassword(email);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Có lỗi xảy ra');
      throw err;
    }
  };

  const resetPassword = async (
    token: string, 
    password: string
  ) => {
    try {
      setError(null);
      await authService.resetPassword(token, password);
    } catch (err: any) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Đặt lại mật khẩu thất bại');
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        refreshCredits,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
