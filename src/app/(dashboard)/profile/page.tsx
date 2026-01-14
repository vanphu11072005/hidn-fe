'use client';

import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import { authService } from '@/services/auth';
import type { ProfileResponse } from '@/types/auth.types';
export default function ProfilePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const getImageSrc = (src: string | null | undefined) => {
    if (!src) return '/default-avatar.png';
    // blob: and data: and http(s) should be used as-is
    if (src.startsWith('blob:') || src.startsWith('data:') || src.startsWith('http')) {
      return src;
    }
    // otherwise assume server-relative path like '/uploads/..'
    return `${API_URL}${src}`;
  };
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
    visible: boolean;
  }>({ type: 'success', text: '', visible: false });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const p = await authService.getProfile();
        setProfile(p);
        setDisplayName(p.displayName || p.email || '');
        setEmail(p.email || '');
        setPreviewUrl(p.avatarUrl || null);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > 5 * 1024 * 1024) {
      setMessage('Ảnh quá lớn (tối đa 5MB)');
      return;
    }
    setMessage(null);
    setAvatarFile(f);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setToast(prev => ({ ...prev, visible: false }));

    try {
      const form = new FormData();
      form.append('display_name', displayName);
      if (avatarFile) form.append('avatar', avatarFile);

      const updated = await authService.updateProfile(form);
      setProfile(updated);
      setPreviewUrl(updated.avatarUrl || null);
      setMessage('Cập nhật profile thành công');
      setToast({ type: 'success', text: 'Cập nhật profile thành công', visible: true });
    } catch (err: any) {
      console.error('Update profile failed', err);
      setMessage(err.message || 'Có lỗi xảy ra');
      setToast({ type: 'error', text: err.message || 'Có lỗi xảy ra',
        visible: true });
    } finally {
      setLoading(false);
    }
  };

  // Auto hide toast after 3s
  useEffect(() => {
    if (!toast.visible) return;
    const id = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
    return () => clearTimeout(id);
  }, [toast.visible]);

  return (
    <div className="min-h-screen rounded-3xl bg-slate-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl">
            <h1 className="text-3xl font-semibold">Hồ sơ cá nhân</h1>
            <p className="mt-2 text-white/80 text-sm">
            Cập nhật thông tin hiển thị và quản lý tài khoản của bạn
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {/* LEFT: Profile Card */}
            <aside className="lg:col-span-1">
            <div className="rounded-3xl bg-white p-6 shadow-sm border h-full
              dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                <div className="relative">
                    <div 
                      className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-indigo-100 cursor-pointer group relative"
                      onClick={openFilePicker}
                    >
                    <img
                      src={getImageSrc(previewUrl)}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      group-hover:scale-105">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                </div>

                <h3 className="mt-4 text-xl font-semibold dark:text-white">
                  {profile?.displayName || 'Không tên'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile?.email}
                </p>

                </div>
            </div>
            </aside>

            {/* RIGHT: Form */}
            <main className="lg:col-span-2">
            <div className="rounded-3xl bg-white p-8 shadow-sm border h-full
              dark:bg-gray-800 dark:border-gray-700">
                <form onSubmit={onSubmit} className="space-y-8">

                {/* Display name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                    Tên hiển thị
                    </label>
                    <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nhập tên hiển thị"
                    className="w-full rounded-xl border px-5 py-3
                      focus:outline-none focus:ring-2 focus:ring-indigo-500
                      dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400
                      dark:text-white"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-200">
                      Email
                    </label>
                    <input
                      value={email}
                      readOnly
                      placeholder="Email của bạn"
                      aria-readonly="true"
                      className="w-full rounded-xl border px-5 py-3 bg-slate-50
                        cursor-not-allowed text-gray-600 focus:outline-none focus:ring-0
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 justify-end">
                    <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl bg-indigo-600
                      text-white font-medium
                      hover:bg-indigo-700 disabled:opacity-60
                      dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>

                    <button
                    type="button"
                    onClick={() => {
                        setDisplayName(profile?.displayName || '');
                        setAvatarFile(null);
                        setPreviewUrl(profile?.avatarUrl || null);
                        setMessage(null);
                    }}
                    className="px-6 py-3 rounded-xl border text-sm
                      hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                    >
                    Hủy
                    </button>
                </div>

                {/* inline message removed (toast used instead) */}
                </form>
            </div>
            </main>
        </div>

        {/* Toast */}
        {toast.visible && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div
              role="status"
              aria-live="polite"
              className={`px-6 py-3 rounded-xl shadow-xl text-white
                flex items-center gap-2
                animate-slide-down
                ${toast.type === 'success'
                  ? 'bg-emerald-600'
                  : 'bg-rose-600'
                }`}
            >
              {toast.text}
            </div>
          </div>
        )}
        </div>
    </div>
    );
}
