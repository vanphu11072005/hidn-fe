'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, Logo } from '@/components/common';
import { Mail, Clock } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const {
    user,
    refreshUser,
    loading,
    error,
    verifyEmail,
    resendVerification,
    clearError,
  } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  // Redirect if already verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (
    index: number, 
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(
        `code-${index + 1}`
      );
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number, 
    e: React.KeyboardEvent
  ) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(
        `code-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      alert('Vui lòng nhập đầy đủ 6 số');
      return;
    }

    try {
      await verifyEmail(verificationCode);
    } catch (err: any) {
      console.error(err);
    } finally {
    }
  };

  const handleResend = async () => {
    try {
      clearError();
      await resendVerification();
      setCountdown(60); // 60 seconds cooldown
      setCode(['', '', '', '', '', '']);
    } catch (err: any) {
      console.error(err);
    } finally {
    }
  };

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
            Xác thực email
          </h2>
          <p className="text-gray-600 mt-2">
            Nhập mã 6 số đã được gửi đến
          </p>
          <p className="text-blue-600 font-medium mt-1">
            {user?.email}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-md rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 
                text-red-700 px-4 py-3 rounded-lg text-sm 
                flex items-start space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 
              p-4 rounded-lg text-sm text-blue-800 
              flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-600 
                flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  Kiểm tra email của bạn
                </p>
                <p>
                  Mã xác thực có hiệu lực trong 10 phút. 
                  Nếu không thấy email, hãy kiểm tra thư mục 
                  spam.
                </p>
              </div>
            </div>

            {/* Code Input */}
            <div>
              <label className="block text-sm font-medium 
                text-gray-700 mb-3 text-center">
                Mã xác thực
              </label>
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => 
                      handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-2xl 
                      font-bold border-2 border-gray-300 
                      rounded-lg focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 
                      focus:border-transparent"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || code.join('').length !== 6}
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              {countdown > 0 ? (
                <div className="flex items-center justify-center 
                  space-x-2 text-gray-600 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Gửi lại sau {countdown}s
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 
                    text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Đang gửi...' : 'Gửi lại mã'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Note */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Bạn có thể đóng trang này và quay lại sau khi 
          nhận được email
        </p>
      </div>
    </div>
  );
}
