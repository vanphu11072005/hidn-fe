"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/common';
import Link from 'next/link';
import {
  Coins,
  Clock,
  FileText,
  HelpCircle,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/services/api/client';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // freeCredits removed
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [usedToday, setUsedToday] = useState<number>(0);
  type MeResponse = {
    id?: number;
    email?: string;
    credits?: {
      freeCredits?: number;
      paidCredits?: number;
      totalCredits?: number;
    };
  };
  type Costs = {
    summary?: number;
    questions?: number;
    explain?: number;
    rewrite?: number;
    [key: string]: number | undefined;
  };
  type UsageResponse = {
    history?: Array<{
      created_at: string;
      credits_used?: number;
    }>;
  };

  const [costs, setCosts] = useState<Costs>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user info and credits
        try {
          const me = await apiClient.get<MeResponse>('/api/user/me');
          console.log('User data:', me);
          if (me && me.credits) {
            setTotalCredits(me.credits.totalCredits || 0);
          }
        } catch (err: any) {
          console.error('Failed to load user data:', {
            message: err?.message || err?.toString() || 'Unknown error',
            statusCode: err?.statusCode,
            fullError: err,
          });
          throw new Error('Không thể tải thông tin người dùng');
        }

        // Fetch credit costs
        try {
          const costsRes = await apiClient.get<Costs>('/api/wallet/costs');
          console.log('Costs data:', costsRes);
          if (costsRes) setCosts(costsRes);
        } catch (err: any) {
          console.error('Failed to load costs:', {
            message: err?.message || err?.toString() || 'Unknown error',
            statusCode: err?.statusCode,
            fullError: err,
          });
          // Non-critical, continue
        }

        // Fetch usage history
        try {
          const usage = await apiClient.get<UsageResponse>('/api/user/usage?limit=50');
          console.log('Usage data:', usage);
          if (usage && Array.isArray(usage.history)) {
            const today = new Date().toDateString();
            const creditsUsedToday = usage.history.reduce((acc, h) => {
              const d = new Date(h.created_at).toDateString();
              if (d === today) {
                return acc + (h.credits_used || 0);
              }
              return acc;
            }, 0);
            setUsedToday(creditsUsedToday);
          }
        } catch (err: any) {
          console.error('Failed to load usage:', {
            message: err?.message || err?.toString() || 'Unknown error',
            statusCode: err?.statusCode,
            fullError: err,
          });
          // Non-critical, continue
        }
      } catch (err: any) {
        console.error('Dashboard error:', err, JSON.stringify(err));
        setError(err.message || 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl 
        border border-gray-200 dark:border-white/10 
        bg-white dark:bg-[#121212] p-8">

        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 
          rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 
          rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold text-primary dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400 max-w-xl">
            Chào mừng trở lại 👋 Quản lý credits và bắt đầu học nhanh với AI của Hidn.
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            {/* Credits */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 
              bg-gray-50 dark:bg-white/5 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Credits còn lại
              </p>
              <p className="mt-2 text-3xl font-semibold text-blue-600 dark:text-blue-400">
                {loading ? '—' : totalCredits}
              </p>
            </div>

            {/* Used Today */}
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 
              bg-gray-50 dark:bg-white/5 p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Đã dùng hôm nay
              </p>
              <p className="mt-2 text-3xl font-semibold text-primary dark:text-white">
                {loading ? '—' : usedToday}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {/* TOOLS */}
      <section>
        <h2 className="text-2xl font-semibold text-primary dark:text-white mb-6">
          Công cụ AI
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TOOL CARD */}
          <Link href="/tools/summary" className="group">
            <div className="h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#181818] p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-white">
                    Tóm tắt thông minh
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tóm gọn tài liệu dài trong vài giây
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-blue-600 font-medium">
                {costs.summary ? `${costs.summary} credit / lần` : '—'}
              </div>
            </div>
          </Link>

          <Link href="/tools/questions" className="group">
            <div className="h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#181818] p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-white">
                    Tạo câu hỏi
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sinh câu hỏi ôn tập từ tài liệu
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-purple-600 font-medium">
                {costs.questions ? `${costs.questions} credit / lần` : '—'}
              </div>
            </div>
          </Link>

          <Link href="/tools/explain" className="group">
            <div className="h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#181818] p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-white">
                    Giải thích dễ hiểu
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hiểu nhanh khái niệm khó
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-yellow-600 font-medium">
                {costs.explain ? `${costs.explain} credit / lần` : '—'}
              </div>
            </div>
          </Link>

          <Link href="/tools/rewrite" className="group">
            <div className="h-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#181818] p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary dark:text-white">
                    Viết lại học thuật
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Chỉnh văn phong học thuật, chuẩn chỉnh
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-green-600 font-medium">
                {costs.rewrite ? `${costs.rewrite} credit / lần` : '—'}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* QUICK ACTION */}
      <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#181818] p-6">
        <h2 className="text-xl font-semibold text-primary dark:text-white mb-4">
          Hành động nhanh
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/credits">
            <Button variant="primary">Nạp Credits</Button>
          </Link>
          <Link href="/history">
            <Button variant="outline">Lịch sử sử dụng</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
