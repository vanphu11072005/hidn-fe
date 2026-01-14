'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Zap, 
  BarChart3,
  Coins,
  Activity,
  ArrowUpDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { 
  adminService,
  type ToolAnalytics,
} from '@/services/admin';

type SortField = 'usage' | 'credits' | 'rate' | 'rank';

export default function AdminToolAnalyticsPage() {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [analytics, setAnalytics] = useState<ToolAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await adminService.getToolAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch tool analytics:', err);
        setError('Không thể tải dữ liệu analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Calculate totals
  const totalUsage = analytics.reduce(
    (sum, tool) => sum + tool.totalUsage, 
    0
  );
  const totalCredits = analytics.reduce(
    (sum, tool) => sum + tool.totalCreditsSpent,
    0
  );
  const avgSuccessRate = analytics.length > 0
    ? analytics.reduce((sum, tool) => sum + tool.successRate, 0) / 
      analytics.length
    : 0;

  // Find top tool
  const topTool = analytics.length > 0
    ? analytics.reduce((prev, current) =>
        current.totalCreditsSpent > prev.totalCreditsSpent 
          ? current 
          : prev
      )
    : null;

  // Sort analytics
  const sortedAnalytics = [...analytics].sort((a, b) => {
    let aVal: number, bVal: number;
    
    switch (sortField) {
      case 'usage':
        aVal = a.totalUsage;
        bVal = b.totalUsage;
        break;
      case 'credits':
        aVal = a.totalCreditsSpent;
        bVal = b.totalCreditsSpent;
        break;
      case 'rate':
        aVal = a.successRate;
        bVal = b.successRate;
        break;
      case 'rank':
      default:
        aVal = a.popularityRank;
        bVal = b.popularityRank;
        break;
    }

    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  // Get max values for chart scaling
  const maxUsage = analytics.length > 0 
    ? Math.max(...analytics.map((t) => t.totalUsage)) 
    : 0;
  const maxCredits = analytics.length > 0 
    ? Math.max(...analytics.map((t) => t.totalCreditsSpent)) 
    : 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading ? (
        <div 
          className="
            flex items-center justify-center 
            min-h-[400px]
          "
        >
          <div className="text-center">
            <Loader2 
              className="
                w-8 h-8 animate-spin text-blue-500 
                mx-auto mb-3
              " 
            />
            <p className="text-sm text-slate-400">
              Đang tải analytics...
            </p>
          </div>
        </div>
      ) : error ? (
        <div 
          className="
            p-6 rounded-lg border bg-red-500/10 
            border-red-500/50 text-center
          "
        >
          <AlertCircle 
            className="w-8 h-8 text-red-400 mx-auto mb-3" 
          />
          <p className="text-sm text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="
              px-4 py-2 bg-red-600 text-white 
              rounded-lg hover:bg-red-700 
              transition-colors text-sm
            "
          >
            Thử lại
          </button>
        </div>
      ) : analytics.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          Chưa có dữ liệu sử dụng tool
        </div>
      ) : (
        <>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Tool Usage Analytics
        </h1>
        <p className="text-sm text-slate-400">
          Phân tích chi tiết mức độ sử dụng các AI tools
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="
                w-10 h-10 bg-blue-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Tổng Lượt Sử Dụng
              </p>
              <p className="text-2xl font-bold text-white">
                {totalUsage.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="
                w-10 h-10 bg-purple-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Coins className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Tổng Credits Tiêu Thụ
              </p>
              <p className="text-2xl font-bold text-white">
                {totalCredits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="
                w-10 h-10 bg-green-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Tỷ Lệ Thành Công
              </p>
              <p className="text-2xl font-bold text-white">
                {avgSuccessRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-4
          "
        >
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="
                w-10 h-10 bg-yellow-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <TrendingUp className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Tool Đốt Credit Nhất
              </p>
              <p className="text-sm font-bold text-white truncate">
                {topTool?.toolName || 'N/A'}
              </p>
              <p className="text-xs text-slate-500">
                {topTool?.totalCreditsSpent.toLocaleString() || '0'} 
                credits
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Chart */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-6
          "
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">
              Lượt Sử Dụng
            </h2>
          </div>
          <div className="space-y-4">
            {sortedAnalytics.map((tool) => (
              <div key={tool.toolId}>
                <div 
                  className="
                    flex items-center justify-between mb-2
                  "
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">
                      {tool.toolName}
                    </span>
                    {tool.trend !== 'stable' && (
                      <span 
                        className={`
                          text-xs font-medium
                          ${
                            tool.trend === 'up'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        `}
                      >
                        {tool.trend === 'up' ? '↑' : '↓'} 
                        {Math.abs(tool.trendPercentage)}%
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold text-white">
                    {tool.totalUsage.toLocaleString()}
                  </span>
                </div>
                <div 
                  className="
                    w-full h-3 bg-slate-800 rounded-full 
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full bg-gradient-to-r from-blue-600 
                      to-blue-500 transition-all
                    "
                    style={{
                      width: `${(tool.totalUsage / maxUsage) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credits Chart */}
        <div 
          className="
            bg-slate-900 border border-slate-800 
            rounded-lg p-6
          "
        >
          <div className="flex items-center gap-2 mb-4">
            <Coins className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-white">
              Credits Tiêu Thụ
            </h2>
          </div>
          <div className="space-y-4">
            {sortedAnalytics
              .sort((a, b) => b.totalCreditsSpent - a.totalCreditsSpent)
              .map((tool) => (
                <div key={tool.toolId}>
                  <div 
                    className="
                      flex items-center justify-between mb-2
                    "
                  >
                    <span className="text-sm text-slate-300">
                      {tool.toolName}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        {tool.totalCreditsSpent.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        ≈ {tool.avgCreditsPerUse}/lần
                      </p>
                    </div>
                  </div>
                  <div 
                    className="
                      w-full h-3 bg-slate-800 rounded-full 
                      overflow-hidden
                    "
                  >
                    <div
                      className="
                        h-full bg-gradient-to-r from-purple-600 
                        to-purple-500 transition-all
                      "
                      style={{
                        width: `${
                          (tool.totalCreditsSpent / maxCredits) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg overflow-hidden
        "
      >
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">
            Chi Tiết Từng Tool
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click vào header để sắp xếp
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider cursor-pointer 
                    hover:text-white transition-colors
                  "
                  onClick={() => handleSort('rank')}
                >
                  <div className="flex items-center gap-2">
                    Rank
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  Tool
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider cursor-pointer 
                    hover:text-white transition-colors
                  "
                  onClick={() => handleSort('usage')}
                >
                  <div className="flex items-center gap-2">
                    Lượt Dùng
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider cursor-pointer 
                    hover:text-white transition-colors
                  "
                  onClick={() => handleSort('credits')}
                >
                  <div className="flex items-center gap-2">
                    Credits Tổng
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  TB / Lần
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider cursor-pointer 
                    hover:text-white transition-colors
                  "
                  onClick={() => handleSort('rate')}
                >
                  <div className="flex items-center gap-2">
                    Success Rate
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  Xu Hướng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedAnalytics.map((tool) => (
                <tr 
                  key={tool.toolId}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  {/* Rank */}
                  <td className="px-6 py-4">
                    <div 
                      className="
                        w-8 h-8 rounded-full bg-slate-800 
                        flex items-center justify-center
                      "
                    >
                      <span className="text-sm font-bold text-white">
                        #{tool.popularityRank}
                      </span>
                    </div>
                  </td>

                  {/* Tool Name */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">
                      {tool.toolName}
                    </span>
                  </td>

                  {/* Usage */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {tool.totalUsage.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {((tool.totalUsage / totalUsage) * 100).toFixed(1)}% 
                        của tổng
                      </p>
                    </div>
                  </td>

                  {/* Total Credits */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-purple-400">
                        {tool.totalCreditsSpent.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {((tool.totalCreditsSpent / totalCredits) * 100).toFixed(1)}% 
                        của tổng
                      </p>
                    </div>
                  </td>

                  {/* Avg Credits */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-300">
                      {tool.avgCreditsPerUse}
                    </span>
                  </td>

                  {/* Success Rate */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="
                          flex-1 h-2 bg-slate-800 rounded-full 
                          overflow-hidden max-w-[60px]
                        "
                      >
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${tool.successRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-white">
                        {tool.successRate}%
                      </span>
                    </div>
                  </td>

                  {/* Trend */}
                  <td className="px-6 py-4">
                    {tool.trend === 'stable' ? (
                      <span 
                        className="
                          inline-flex px-2.5 py-1 rounded-full 
                          text-xs font-medium bg-slate-700 
                          text-slate-300
                        "
                      >
                        Ổn định
                      </span>
                    ) : (
                      <span
                        className={`
                          inline-flex px-2.5 py-1 rounded-full 
                          text-xs font-medium
                          ${
                            tool.trend === 'up'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                          }
                        `}
                      >
                        {tool.trend === 'up' ? '↑' : '↓'} 
                        {Math.abs(tool.trendPercentage)}%
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
