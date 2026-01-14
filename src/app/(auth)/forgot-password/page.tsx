'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Logo } from '@/components/common';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, loading, error, clearError } = 
    useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setLocalError('');
    clearError();
  };

  const validateEmail = () => {
    if (!email) {
      setLocalError('Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Email không đúng định dạng');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
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
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 
                mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary 
                mb-2">
                Kiểm tra email của bạn
              </h2>
              <p className="text-gray-600">
                Nếu email <strong>{email}</strong> tồn tại 
                trong hệ thống, bạn sẽ nhận được link đặt lại 
                mật khẩu.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 
              p-4 rounded-lg text-sm text-blue-800 mb-6">
              <p className="mb-2">
                📧 Vui lòng kiểm tra hộp thư đến và 
                thư mục spam
              </p>
              <p className="text-xs text-blue-700">
                Link có hiệu lực trong 60 phút
              </p>
            </div>

            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay về đăng nhập
            </Button>
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
            <div className="inline-flex justify-center mb-4 p-3 rounded-full bg-transparent">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto" />
            </div>
          <h2 className="text-2xl font-bold text-primary">
            Quên mật khẩu
          </h2>
          <p className="text-gray-600 mt-2">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-md 
          rounded-lg">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Error Alert */}
            {(localError || error) && (
              <div className="bg-red-50 border border-red-200 
                text-red-700 px-4 py-3 rounded-lg text-sm 
                flex items-start space-x-2">
                <span>⚠️</span>
                <span>{localError || error}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium 
                  text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 
                  pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10 w-full px-4 py-2 
                    border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 
                    focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 
                  text-sm font-medium inline-flex 
                  items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Quay về đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
