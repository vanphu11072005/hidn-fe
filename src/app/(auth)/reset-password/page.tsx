'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Logo } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { resetPassword, loading, error, clearError } = 
    useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = 
    useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = 
    useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLocalError('Link đặt lại mật khẩu không hợp lệ');
    }
  }, [token]);

  const validatePassword = () => {
    if (password.length < 8) {
      setLocalError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setLocalError(
        'Mật khẩu phải chứa chữ hoa, chữ thường và số'
      );
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!token) {
      setLocalError('Link đặt lại mật khẩu không hợp lệ');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      // Error handled by context
      console.error(err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center 
        justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-4 p-3 rounded-full bg-transparent">
                <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
              </div>
          </div>

          <div className="bg-white py-8 px-6 shadow-md 
            rounded-lg text-center">
            <CheckCircle className="w-16 h-16 text-green-500 
              mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary 
              mb-2">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Đang chuyển về trang đăng nhập...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center 
      justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-4 p-3 rounded-full bg-[#0866ff]">
            <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
          </div>
          <h2 className="text-2xl font-bold text-primary">
            Đặt lại mật khẩu
          </h2>
          <p className="text-gray-600 mt-2">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-md 
          rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 
                text-red-700 px-4 py-3 rounded-lg text-sm 
                flex items-start space-x-2">
                <span>⚠️</span>
                <span>{localError || error}</span>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 
                  pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-2 
                    border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 
                    focus:ring-blue-500 
                    focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                  disabled={loading || !token}
                />
                <button
                  type="button"
                  onClick={() => 
                    setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 
                    pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 
                      text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ít nhất 8 ký tự, có chữ hoa, chữ thường và số
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 
                  pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword ? 'text' : 'password'
                  }
                  required
                  value={confirmPassword}
                  onChange={(e) => 
                    setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-2 
                    border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 
                    focus:ring-blue-500 
                    focus:border-transparent"
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading || !token}
                />
                <button
                  type="button"
                  onClick={() => 
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute inset-y-0 right-0 
                    pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 
                      text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || !token}
            >
              {loading ? 
                'Đang đặt lại...' : 
                'Đặt lại mật khẩu'}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 
                  hover:text-blue-700 text-sm font-medium"
              >
                Quay về đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center 
        justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 
            w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
