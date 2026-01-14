'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Zap,
  Mail,
  Server,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import { adminService } from '@/services/admin/admin.service';
import type {
  SystemLog as APISystemLog,
  SystemLogLevel,
  SystemLogType,
  SystemStats,
} from '@/services/admin/admin.service';

// Types
type LogLevel = SystemLogLevel;
type LogType = SystemLogType;

interface SystemLog {
  id: number;
  level: LogLevel;
  type: LogType;
  message: string;
  errorCode?: string;
  userId?: number;
  userEmail?: string;
  toolType?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}



export default function AdminLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<LogType | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const [logsResponse, statsResponse] = await Promise.all([
          adminService.getSystemLogs({
            page,
            limit: 20,
            level: selectedLevel === 'all' ? undefined : selectedLevel,
            type: selectedType === 'all' ? undefined : selectedType,
            search: searchQuery || undefined,
          }),
          adminService.getSystemStats(),
        ]);

        setLogs(logsResponse.logs);
        setTotalPages(logsResponse.pagination.totalPages);
        setStats(statsResponse);
      } catch (err) {
        console.error('Error fetching system logs:', err);
        setError('Không thể tải logs. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [page, selectedLevel, selectedType, searchQuery]);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery(debouncedSearch);
  }, [debouncedSearch]);

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: LogType) => {
    switch (type) {
      case 'system':
        return <Server className="w-4 h-4" />;
      case 'ai':
        return <Zap className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'auth':
        return <User className="w-4 h-4" />;
      case 'database':
        return <Server className="w-4 h-4" />;
      case 'payment':
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          System Logs
        </h1>
        <p className="text-sm text-slate-400">
          Theo dõi và debug các hoạt động hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Tổng Logs</p>
              <p className="text-2xl font-bold text-white">
                {stats?.totalLogs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Errors</p>
              <p className="text-2xl font-bold text-red-400">
                {stats?.totalErrors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Warnings</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats?.totalWarnings || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 mb-2">Phân loại</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                <span className="text-slate-400">AI: {stats?.byType.ai || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-400" />
                <span className="text-slate-400">Email: {stats?.byType.email || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Server className="w-3 h-3 text-green-400" />
                <span className="text-slate-400">System: {stats?.byType.system || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-orange-400" />
                <span className="text-slate-400">Auth: {stats?.byType.auth || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo message, email, error code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2.5 rounded-lg
                bg-slate-800 border border-slate-700
                text-white text-sm placeholder-slate-500
                focus:border-blue-500 focus:outline-none
              "
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="
              px-4 py-2.5 rounded-lg border border-slate-700
              text-sm font-medium text-slate-300
              hover:bg-slate-800 hover:text-white
              transition-all flex items-center gap-2
            "
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Loại Log
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'system', 'ai', 'email', 'auth', 'database', 'payment'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type as LogType | 'all')}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all
                      ${
                        selectedType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }
                    `}
                  >
                    {type === 'all' ? 'Tất cả' : type.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Mức độ
              </label>
              <div className="flex flex-wrap gap-2">
                {['all', 'error', 'warning', 'info'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level as LogLevel | 'all')}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all
                      ${
                        selectedLevel === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }
                    `}
                  >
                    {level === 'all' ? 'Tất cả' : level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Context
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <p className="text-slate-400">
                      {loading ? 'Đang tải...' : 'Không tìm thấy log nào'}
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Level */}
                    <td className="px-6 py-4">
                      {getLevelIcon(log.level)}
                    </td>

                    {/* Type */}
                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 
                          rounded-full text-xs font-medium
                          ${
                            log.type === 'ai'
                              ? 'bg-purple-500/10 text-purple-400'
                              : log.type === 'email'
                              ? 'bg-blue-500/10 text-blue-400'
                              : log.type === 'auth'
                              ? 'bg-orange-500/10 text-orange-400'
                              : log.type === 'database'
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-slate-700 text-slate-300'
                          }
                        `}
                      >
                        {getTypeIcon(log.type)}
                        {log.type.toUpperCase()}
                      </span>
                    </td>

                    {/* Message */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-white max-w-md truncate">
                        {log.message}
                      </p>
                      {log.errorCode && (
                        <p className="text-xs text-slate-500 mt-1">
                          Code: {log.errorCode}
                        </p>
                      )}
                    </td>

                    {/* Context */}
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {log.userEmail && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <User className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">
                              {log.userEmail}
                            </span>
                          </div>
                        )}
                        {log.toolType && (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Zap className="w-3 h-3" />
                            <span>{log.toolType}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {formatTimestamp(log.createdAt)}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="
                          text-xs font-medium text-blue-400
                          hover:text-blue-300 transition-colors
                        "
                      >
                        Chi tiết →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getLevelIcon(selectedLog.level)}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Log Details
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="
                  p-2 rounded-lg hover:bg-slate-800
                  text-slate-400 hover:text-white transition-all
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Type
                  </label>
                  <span
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5
                      rounded-lg text-sm font-medium
                      ${
                        selectedLog.type === 'ai'
                          ? 'bg-purple-500/10 text-purple-400'
                          : selectedLog.type === 'email'
                          ? 'bg-blue-500/10 text-blue-400'
                          : selectedLog.type === 'auth'
                          ? 'bg-orange-500/10 text-orange-400'
                          : selectedLog.type === 'database'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-slate-700 text-slate-300'
                      }
                    `}
                  >
                    {getTypeIcon(selectedLog.type)}
                    {selectedLog.type.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Level
                  </label>
                  <span className="text-sm font-medium text-white">
                    {selectedLog.level.toUpperCase()}
                  </span>
                </div>

                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1">
                    Timestamp
                  </label>
                  <span className="text-sm text-white">
                    {selectedLog.createdAt.toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  Message
                </label>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-white">{selectedLog.message}</p>
                </div>
              </div>

              {/* Context */}
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-2">
                  Context
                </label>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
                  {selectedLog.userEmail && (
                    <div>
                      <span className="text-xs text-slate-500">User Email:</span>
                      <p className="text-sm text-white mt-0.5">
                        {selectedLog.userEmail}
                      </p>
                    </div>
                  )}
                  {selectedLog.userId && (
                    <div>
                      <span className="text-xs text-slate-500">User ID:</span>
                      <p className="text-sm text-white mt-0.5">
                        {selectedLog.userId}
                      </p>
                    </div>
                  )}
                  {selectedLog.toolType && (
                    <div>
                      <span className="text-xs text-slate-500">Tool:</span>
                      <p className="text-sm text-white mt-0.5">
                        {selectedLog.toolType}
                      </p>
                    </div>
                  )}
                  {selectedLog.errorCode && (
                    <div>
                      <span className="text-xs text-slate-500">Error Code:</span>
                      <p className="text-sm text-white mt-0.5 font-mono">
                        {selectedLog.errorCode}
                      </p>
                    </div>
                  )}
                  {selectedLog.metadata && (
                    <div>
                      <span className="text-xs text-slate-500">Metadata:</span>
                      <pre className="text-xs text-slate-300 mt-1 bg-slate-900 p-3 rounded overflow-x-auto">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="
                  px-4 py-2 rounded-lg bg-slate-800
                  text-sm font-medium text-white
                  hover:bg-slate-700 transition-all
                "
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
