'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp,
  UserPlus,
  Coins,
  Sparkles,
  Loader2,
} from 'lucide-react';

// Types
interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  totalCreditsUsed: number;
  totalCreditsRemaining: number;
  mostUsedTool: {
    name: string;
    usage: number;
    percentage: number;
  };
}

interface ChartData {
  label: string;
  value: number;
}

interface ToolUsage {
  name: string;
  value: number;
  color: string;
}

interface Activity {
  user: string;
  action: string;
  tool: string;
  credits: number;
  time: string;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usageData, setUsageData] = useState<ChartData[]>([]);
  const [toolUsage, setToolUsage] = useState<ToolUsage[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard/stats`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data.stats);
        setUsageData(result.data.usageData);
        setToolUsage(result.data.toolUsage);
        setRecentActivity(result.data.recentActivity);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="
              px-4 py-2 rounded-lg bg-blue-600
              text-sm font-medium text-white
              hover:bg-blue-700 transition-all
            "
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxUsage = Math.max(...usageData.map((d) => d.value), 1);
  const maxToolUsage = Math.max(...toolUsage.map((t) => t.value), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-slate-400">
          Tổng quan hệ thống • {new Date().toLocaleDateString(
            'vi-VN'
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div 
        className="
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 
          gap-4
        "
      >
        {/* Total Users */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="
                w-10 h-10 bg-blue-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Tổng Users
              </p>
              <p className="text-2xl font-bold text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* New Users Today */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="
                w-10 h-10 bg-green-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <UserPlus className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Users mới hôm nay
              </p>
              <p className="text-2xl font-bold text-white">
                +{stats.newUsersToday}
              </p>
            </div>
          </div>
        </div>

        {/* Total Credits Used */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="
                w-10 h-10 bg-purple-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <TrendingUp 
                className="w-5 h-5 text-purple-500" 
              />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Credits đã dùng
              </p>
              <p className="text-2xl font-bold text-white">
                {stats.totalCreditsUsed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Credits Remaining */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="
                w-10 h-10 bg-yellow-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Credits còn lại
              </p>
              <p className="text-2xl font-bold text-white">
                {stats.totalCreditsRemaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Most Used Tool */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="
                w-10 h-10 bg-pink-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Sparkles className="w-5 h-5 text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">
                Tool phổ biến nhất
              </p>
              <p 
                className="
                  text-sm font-semibold text-white 
                  truncate
                "
              >
                {stats.mostUsedTool.name}
              </p>
              <p className="text-xs text-slate-500">
                {stats.mostUsedTool.usage.toLocaleString()} 
                lượt ({stats.mostUsedTool.percentage}%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Trend Chart */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-6
          "
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Xu hướng sử dụng (7 ngày)
          </h2>
          <div className="space-y-3">
            {usageData.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <span 
                  className="
                    w-8 text-xs text-slate-400 
                    font-medium
                  "
                >
                  {day.label}
                </span>
                <div 
                  className="
                    flex-1 h-8 bg-slate-800 rounded-md 
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full bg-gradient-to-r 
                      from-blue-600 to-blue-500 
                      flex items-center justify-end 
                      pr-2 transition-all
                    "
                    style={{
                      width: `${(day.value / maxUsage) * 100}%`,
                    }}
                  >
                    <span 
                      className="
                        text-xs font-semibold text-white
                      "
                    >
                      {day.value}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Số lượng AI requests mỗi ngày
          </p>
        </div>

        {/* Tool Usage Distribution */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-6
          "
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Phân bổ công cụ AI
          </h2>
          <div className="space-y-4">
            {toolUsage.map((tool, index) => (
              <div key={index}>
                <div 
                  className="
                    flex items-center justify-between 
                    mb-2
                  "
                >
                  <span className="text-sm text-slate-300">
                    {tool.name}
                  </span>
                  <span 
                    className="
                      text-sm font-semibold text-white
                    "
                  >
                    {tool.value.toLocaleString()}
                  </span>
                </div>
                <div 
                  className="
                    w-full h-2 bg-slate-800 rounded-full 
                    overflow-hidden
                  "
                >
                  <div
                    className={`h-full ${tool.color} transition-all`}
                    style={{
                      width: `${
                        (tool.value / maxToolUsage) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Tổng số lần sử dụng từng công cụ
          </p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Hoạt động gần đây
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr 
                className="
                  border-b border-slate-800 text-left
                "
              >
                <th 
                  className="
                    pb-3 text-xs font-semibold 
                    text-slate-400 uppercase
                  "
                >
                  User
                </th>
                <th 
                  className="
                    pb-3 text-xs font-semibold 
                    text-slate-400 uppercase
                  "
                >
                  Hành động
                </th>
                <th 
                  className="
                    pb-3 text-xs font-semibold 
                    text-slate-400 uppercase
                  "
                >
                  Tool
                </th>
                <th 
                  className="
                    pb-3 text-xs font-semibold 
                    text-slate-400 uppercase
                  "
                >
                  Credits
                </th>
                <th 
                  className="
                    pb-3 text-xs font-semibold 
                    text-slate-400 uppercase text-right
                  "
                >
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr 
                  key={index} 
                  className="border-b border-slate-800/50"
                >
                  <td className="py-3 text-sm text-slate-300">
                    {activity.user}
                  </td>
                  <td className="py-3 text-sm text-slate-400">
                    {activity.action}
                  </td>
                  <td className="py-3 text-sm text-slate-400">
                    {activity.tool}
                  </td>
                  <td 
                    className={`
                      py-3 text-sm font-semibold
                      ${
                        activity.credits > 0
                          ? 'text-green-400'
                          : activity.credits < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }
                    `}
                  >
                    {activity.credits > 0 && '+'}
                    {activity.credits !== 0 
                      ? activity.credits 
                      : '-'}
                  </td>
                  <td 
                    className="
                      py-3 text-sm text-slate-500 text-right
                    "
                  >
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
