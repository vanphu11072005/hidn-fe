'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  AlertOctagon,
  Search,
  Filter,
  ChevronDown,
  Lock,
  Key,
  CreditCard,
  Zap,
  TrendingUp,
  X,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  adminService,
  type SecurityLog,
  type SecurityEventType,
  type RiskLevel,
} from '@/services/admin';

export default function AdminSecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<
    SecurityEventType | 'all'
  >('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<
    RiskLevel | 'all'
  >('all');
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unresolved: 0,
    high: 0,
    medium: 0,
    byType: {} as { [key: string]: number }
  });

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedEventType, selectedRiskLevel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsResponse, statsResponse] = await Promise.all([
        adminService.getSecurityLogs({
          search: searchQuery || undefined,
          eventType: selectedEventType !== 'all' ? selectedEventType : undefined,
          riskLevel: selectedRiskLevel !== 'all' ? selectedRiskLevel : undefined,
          page: 1,
          limit: 50
        }),
        adminService.getSecurityStats()
      ]);

      setLogs(logsResponse.logs);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (logId: number, notes?: string) => {
    try {
      await adminService.resolveSecurityLog(logId, notes);
      await fetchData();
      setSelectedLog(null);
    } catch (error) {
      console.error('Failed to resolve security log:', error);
    }
  };

  const getEventTypeLabel = (type: SecurityEventType): string => {
    const labels: Record<SecurityEventType, string> = {
      failed_login: 'Failed Login',
      password_reset_spam: 'Password Reset Spam',
      credit_abuse: 'Credit Abuse',
      tool_spam: 'Tool Spam',
      suspicious_activity: 'Suspicious Activity',
      rate_limit_exceeded: 'Rate Limit',
    };
    return labels[type];
  };

  const getEventIcon = (type: SecurityEventType) => {
    switch (type) {
      case 'failed_login':
        return <Lock className="w-4 h-4" />;
      case 'password_reset_spam':
        return <Key className="w-4 h-4" />;
      case 'credit_abuse':
        return <CreditCard className="w-4 h-4" />;
      case 'tool_spam':
        return <Zap className="w-4 h-4" />;
      case 'suspicious_activity':
        return <AlertOctagon className="w-4 h-4" />;
      case 'rate_limit_exceeded':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    const config = {
      high: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cao' },
      medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'TB' },
      low: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Thấp' },
    };
    const style = config[level] || config.low; // Fallback to low if level is invalid
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Security Logs</h1>
        <p className="text-sm text-slate-400">Theo dõi hành vi đáng ngờ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <Shield className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-slate-400">Tổng</p>
        </div>
        <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4">
          <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-400">{stats.unresolved}</p>
          <p className="text-xs text-slate-400">Chưa xử lý</p>
        </div>
        <div className="bg-slate-900 border border-red-500/20 rounded-lg p-4">
          <AlertOctagon className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-400">{stats.high}</p>
          <p className="text-xs text-slate-400">Nguy hiểm</p>
        </div>
        <div className="bg-slate-900 border border-yellow-500/20 rounded-lg p-4">
          <AlertOctagon className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-yellow-400">{stats.medium}</p>
          <p className="text-xs text-slate-400">Cảnh báo</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 rounded-lg border border-slate-700 text-sm font-medium text-slate-300"
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Loại</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'failed_login', 'tool_spam', 'credit_abuse'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedEventType(type as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      selectedEventType === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {type === 'all' ? 'Tất cả' : getEventTypeLabel(type as SecurityEventType)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Mức độ</label>
              <div className="flex flex-wrap gap-2">
                {['all', 'high', 'medium', 'low'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedRiskLevel(level as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs ${
                      selectedRiskLevel === level
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {level === 'all' ? 'Tất cả' : level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Risk</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">User/IP</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4">{getRiskBadge(log.riskLevel)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getEventIcon(log.eventType)}
                        <span className="text-sm text-slate-300">
                          {getEventTypeLabel(log.eventType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{log.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400">
                        {log.userEmail && <div>{log.userEmail}</div>}
                        <div>{log.ipAddress}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-400">{formatTime(log.timestamp)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {log.resolved ? (
                        <span className="px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                          Đã xử lý
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs bg-yellow-500/10 text-yellow-400">
                          Chưa xử lý
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-blue-500 text-white"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Security Log Detail</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400">Type</label>
                  <p className="text-sm text-white">{getEventTypeLabel(selectedLog.eventType)}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Risk</label>
                  <div className="mt-1">{getRiskBadge(selectedLog.riskLevel)}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <p className="text-sm text-white">{selectedLog.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400">IP</label>
                  <p className="text-sm text-white font-mono">{selectedLog.ipAddress}</p>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <p className="text-sm text-white mt-1">{selectedLog.description}</p>
              </div>
              {selectedLog.metadata && (
                <div>
                  <label className="text-xs text-slate-400">Metadata</label>
                  <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded mt-1 overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
              {!selectedLog.resolved && (
                <button
                  onClick={() => handleResolve(selectedLog.id)}
                  className="w-full px-4 py-2 rounded-lg bg-green-500 text-white font-medium"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
