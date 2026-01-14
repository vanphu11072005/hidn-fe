'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  TrendingDown,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { 
  adminService,
  type CreditLog,
  type GetCreditLogsResponse,
} from '@/services/admin';

export default function AdminCreditLogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [toolFilter, setToolFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GetCreditLogsResponse | null>(null);
  const itemsPerPage = 20;

  // Available tool types (based on backend mapping)
  const availableTools = [
    { value: 'summary', label: 'Tóm tắt văn bản' },
    { value: 'questions', label: 'Tạo câu hỏi' },
    { value: 'explain', label: 'Giải thích văn bản' },
    { value: 'rewrite', label: 'Viết lại văn bản' },
  ];

  // Fetch credit logs from API
  useEffect(() => {
    const fetchCreditLogs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await adminService.getCreditLogs({
          search: searchQuery,
          toolType: toolFilter,
          status: statusFilter,
          page: currentPage,
          limit: itemsPerPage,
        });

        setData(response);
      } catch (err) {
        console.error('Failed to fetch credit logs:', err);
        setError('Không thể tải dữ liệu credit logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreditLogs();
  }, [searchQuery, toolFilter, statusFilter, currentPage]);

  // Calculate stats from current data
  const totalCreditsUsed = data?.logs.reduce(
    (sum, log) => 
      sum + (log.status === 'success' ? log.creditsUsed : 0),
    0
  ) || 0;
  const failedCount = 
    data?.logs.filter((log) => log.status === 'failed').length || 0;

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Credit Logs
        </h1>
        <p className="text-sm text-slate-400">
          Lịch sử sử dụng credit toàn hệ thống
          {data && ` • Tổng: ${data.pagination.total} logs`}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <TrendingDown className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Tổng Credits Đã Dùng
              </p>
              <p className="text-2xl font-bold text-white">
                {totalCreditsUsed.toLocaleString()}
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
                w-10 h-10 bg-blue-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <Filter className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Logs Hiện Tại
              </p>
              <p className="text-2xl font-bold text-white">
                {data?.logs.length || 0}
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
                w-10 h-10 bg-red-500/10 rounded-lg 
                flex items-center justify-center
              "
            >
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">
                Thất Bại
              </p>
              <p className="text-2xl font-bold text-white">
                {failedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-4
        "
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search 
                className="
                  absolute left-3 top-1/2 -translate-y-1/2 
                  w-4 h-4 text-slate-400
                " 
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo email user..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleFilterChange();
                }}
                className="
                  w-full pl-10 pr-4 py-2 bg-slate-800 
                  border border-slate-700 rounded-lg 
                  text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent
                  text-sm
                "
              />
            </div>
          </div>

          {/* Tool Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter 
                className="
                  absolute left-3 top-1/2 -translate-y-1/2 
                  w-4 h-4 text-slate-400 pointer-events-none
                " 
              />
              <select
                value={toolFilter}
                onChange={(e) => {
                  setToolFilter(e.target.value);
                  handleFilterChange();
                }}
                className="
                  w-full pl-10 pr-4 py-2 bg-slate-800 
                  border border-slate-700 rounded-lg 
                  text-white
                  focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:border-transparent
                  text-sm appearance-none cursor-pointer
                "
              >
                <option value="">Tất cả tools</option>
                {availableTools.map((tool) => (
                  <option key={tool.value} value={tool.value}>
                    {tool.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                handleFilterChange();
              }}
              className="
                w-full px-4 py-2 bg-slate-800 
                border border-slate-700 rounded-lg 
                text-white
                focus:outline-none focus:ring-2 
                focus:ring-blue-500 focus:border-transparent
                text-sm appearance-none cursor-pointer
              "
            >
              <option value="">Tất cả status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Filter summary */}
        {(searchQuery || toolFilter || statusFilter) && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Tìm thấy {data?.pagination.total || 0} kết quả
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setToolFilter('');
                setStatusFilter('');
                setCurrentPage(1);
              }}
              className="
                text-xs text-blue-400 hover:text-blue-300 
                transition-colors
              "
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg overflow-hidden
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  ID
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  User
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
                    uppercase tracking-wider
                  "
                >
                  Credits
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  Status
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td 
                    colSpan={6} 
                    className="
                      px-6 py-12 text-center text-slate-400
                    "
                  >
                    <div 
                      className="
                        flex items-center justify-center gap-2
                      "
                    >
                      <Loader2 
                        className="w-5 h-5 animate-spin" 
                      />
                      <span>Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td 
                    colSpan={6} 
                    className="
                      px-6 py-12 text-center text-red-400
                    "
                  >
                    {error}
                  </td>
                </tr>
              ) : !data || data.logs.length === 0 ? (
                <tr>
                  <td 
                    colSpan={6} 
                    className="
                      px-6 py-12 text-center text-slate-400
                    "
                  >
                    Không tìm thấy log nào
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="
                      hover:bg-slate-800/30 transition-colors
                    "
                  >
                    {/* Log ID */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400 font-mono">
                        #{log.id}
                      </span>
                    </td>

                    {/* User Email */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {log.userEmail}
                        </p>
                        <p className="text-xs text-slate-500">
                          User ID: {log.userId}
                        </p>
                      </div>
                    </td>

                    {/* Tool Name */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {log.toolName}
                      </span>
                    </td>

                    {/* Credits Used */}
                    <td className="px-6 py-4">
                      <span 
                        className="
                          text-sm font-bold text-red-400
                        "
                      >
                        -{log.creditsUsed}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div>
                        <span
                          className={`
                            inline-flex px-2.5 py-1 rounded-full 
                            text-xs font-medium
                            ${
                              log.status === 'success'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                            }
                          `}
                        >
                          {log.status}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-400">
                        <p>
                          {new Date(log.timestamp).toLocaleDateString(
                            'vi-VN'
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString(
                            'vi-VN'
                          )}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div 
            className="
              px-6 py-4 border-t border-slate-800 
              flex items-center justify-between
            "
          >
            <div className="text-sm text-slate-400">
              Hiển thị{' '}
              {((data.pagination.page - 1) * data.pagination.limit) + 1}
              {' '}-{' '}
              {Math.min(
                data.pagination.page * data.pagination.limit,
                data.pagination.total
              )}
              {' '}trong tổng {data.pagination.total}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="
                  p-2 rounded-lg border border-slate-700 
                  text-slate-400 hover:text-white 
                  hover:border-slate-600 disabled:opacity-50 
                  disabled:cursor-not-allowed transition-colors
                "
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: data.pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  // Show first, last, current, and neighbors
                  if (
                    page === 1 ||
                    page === data.pagination.totalPages ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                          px-3 py-1 rounded-lg text-sm 
                          font-medium transition-colors
                          ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white ' +
                                'hover:bg-slate-800'
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span 
                        key={page} 
                        className="px-2 text-slate-600"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => 
                  setCurrentPage((p) => 
                    Math.min(data.pagination.totalPages, p + 1)
                  )
                }
                disabled={currentPage === data.pagination.totalPages}
                className="
                  p-2 rounded-lg border border-slate-700 
                  text-slate-400 hover:text-white 
                  hover:border-slate-600 disabled:opacity-50 
                  disabled:cursor-not-allowed transition-colors
                "
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
