'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for unauthorized error from middleware
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setError(
        'Bạn không có quyền truy cập trang quản trị. ' +
        'Vui lòng đăng nhập bằng tài khoản ADMIN.'
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email hoặc mật khẩu không đúng');
        setLoading(false);
        return;
      }
      // After sign-in, wait for NextAuth session to be populated
      let session = await getSession();
      let attempts = 0;
      while ((!session || !(session.user as any)?.role) && attempts < 6) {
        // wait 300ms and retry
        await new Promise((r) => setTimeout(r, 300));
        session = await getSession();
        attempts += 1;
      }

      const role = (session?.user as any)?.role;
      if (role === 'admin') {
        router.push('/admin');
        return;
      }

      // Not admin: sign out to clear session and show error
      try {
        await signOut({ redirect: false });
      } catch (e) {
        // ignore
      }
      setError('Tài khoản của bạn không có quyền truy cập trang quản trị.');
      setLoading(false);
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="
        min-h-screen flex items-center justify-center 
        bg-gradient-to-br from-slate-900 via-slate-800 
        to-slate-900
      "
    >
      <div 
        className="
          w-full max-w-md p-8 bg-slate-800/50 
          backdrop-blur-sm rounded-2xl shadow-2xl 
          border border-slate-700
        "
      >
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-8">
          <div 
            className="
              w-16 h-16 bg-gradient-to-br 
              from-blue-500 to-purple-600 rounded-2xl 
              flex items-center justify-center mb-4
            "
          >
            <Image
              src="/logo.svg"
              alt="HIDN Logo"
              width={40}
              height={40}
              className="invert"
            />
          </div>
          <h1 
            className="
              text-3xl font-bold text-white mb-1
            "
          >
            Admin Portal
          </h1>
          <p className="text-slate-400 text-sm">
            Chỉ dành cho quản trị viên
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="
              mb-6 p-4 bg-red-900/30 border 
              border-red-700 rounded-lg
            "
          >
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label 
              htmlFor="email" 
              className="
                block text-sm font-medium text-slate-300 
                mb-2
              "
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-4 py-3 bg-slate-900/50 
                border border-slate-600 rounded-lg 
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent
                transition-all
              "
              placeholder="admin@hidn.vn"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="
                block text-sm font-medium text-slate-300 
                mb-2
              "
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="
                w-full px-4 py-3 bg-slate-900/50 
                border border-slate-600 rounded-lg 
                text-white placeholder-slate-500
                focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent
                transition-all
              "
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 px-4 bg-gradient-to-r 
              from-blue-600 to-purple-600 text-white 
              font-semibold rounded-lg
              hover:from-blue-700 hover:to-purple-700
              focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2 
              focus:ring-offset-slate-800
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all shadow-lg shadow-blue-900/30
            "
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="
              text-sm text-slate-400 hover:text-white 
              transition-colors
            "
          >
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
