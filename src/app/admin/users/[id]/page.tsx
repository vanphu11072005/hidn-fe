'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Shield, Calendar, TrendingUp, 
  TrendingDown, Coins
} from 'lucide-react';
import { adminService, type AdminUserDetail, type CreditTransaction, type ToolUsage } from '@/services/admin';



export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string, 10);

  // State for user data
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const userData = await adminService.getUserById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Không thể tải thông tin user. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && !isNaN(userId)) {
      fetchUser();
    } else {
      setError('ID user không hợp lệ');
      setLoading(false);
    }
  }, [userId]);

  const creditHistory = user?.creditHistory || [];
  const toolUsage = user?.toolUsage || [];

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="
            flex items-center gap-2 text-slate-400 
            hover:text-white transition-colors
          "
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Quay lại danh sách</span>
        </button>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="
            flex items-center gap-2 text-slate-400 
            hover:text-white transition-colors
          "
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Quay lại danh sách</span>
        </button>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-12 text-center">
          <p className="text-red-400">{error || 'User không tồn tại'}</p>
        </div>
      </div>
    );
  }

  const totalCreditsSpent = toolUsage.reduce(
    (sum, tool) => sum + tool.creditsSpent,
    0
  );
  const totalToolUsage = toolUsage.reduce(
    (sum, tool) => sum + tool.usageCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/admin/users')}
        className="
          flex items-center gap-2 text-slate-400 
          hover:text-white transition-colors
        "
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Quay lại danh sách</span>
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Chi tiết User
        </h1>
        <p className="text-sm text-slate-400">
          ID: {user.id} • Email: {user.email}
        </p>
      </div>

      {/* User Info Section */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div 
              className="
                w-10 h-10 bg-blue-500/10 rounded-lg 
                flex items-center justify-center flex-shrink-0
              "
            >
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Email</p>
              <p className="text-sm font-medium text-white">
                {user.email}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <div 
              className="
                w-10 h-10 bg-purple-500/10 rounded-lg 
                flex items-center justify-center flex-shrink-0
              "
            >
              <Shield className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Role</p>
              <span
                className={`
                  inline-flex px-2.5 py-1 rounded-full 
                  text-xs font-medium
                  ${
                    user.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-slate-700 text-slate-300'
                  }
                `}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Credits */}
          <div className="flex items-start gap-3">
            <div 
              className="
                w-10 h-10 bg-yellow-500/10 rounded-lg 
                flex items-center justify-center flex-shrink-0
              "
            >
              <Coins className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Credits hiện tại
              </p>
              <p className="text-sm font-bold text-white">
                {user.credits.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <div 
              className={`
                w-10 h-10 rounded-lg 
                flex items-center justify-center flex-shrink-0
                ${
                  user.status === 'active'
                    ? 'bg-green-500/10'
                    : 'bg-red-500/10'
                }
              `}
            >
              <div
                className={`
                  w-3 h-3 rounded-full
                  ${
                    user.status === 'active'
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }
                `}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Trạng thái
              </p>
              <span
                className={`
                  inline-flex px-2.5 py-1 rounded-full 
                  text-xs font-medium
                  ${
                    user.status === 'active'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }
                `}
              >
                {user.status}
              </span>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-start gap-3">
            <div 
              className="
                w-10 h-10 bg-slate-700 rounded-lg 
                flex items-center justify-center flex-shrink-0
              "
            >
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Ngày tạo tài khoản
              </p>
              <p className="text-sm font-medium text-white">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Last Login */}
          <div className="flex items-start gap-3">
            <div 
              className="
                w-10 h-10 bg-slate-700 rounded-lg 
                flex items-center justify-center flex-shrink-0
              "
            >
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">
                Lần đăng nhập cuối
              </p>
              <p className="text-sm font-medium text-white">
                {new Date(user.lastLogin).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Tools Usage Statistics */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Thống kê AI Tools
          </h2>
          <div className="text-right">
            <p className="text-xs text-slate-400">Tổng sử dụng</p>
            <p className="text-sm font-bold text-white">
              {totalToolUsage} lượt • {totalCreditsSpent} credits
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {toolUsage.map((tool, index) => (
            <div 
              key={index}
              className="
                flex items-center justify-between 
                p-4 bg-slate-800/50 rounded-lg
              "
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">
                  {tool.toolName}
                </p>
                <p className="text-xs text-slate-400">
                  {tool.usageCount} lần sử dụng
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {tool.creditsSpent} credits
                </p>
                <p className="text-xs text-slate-400">
                  ≈ {(tool.creditsSpent / tool.usageCount).toFixed(1)}/lần
                </p>
              </div>
            </div>
          ))}
        </div>

        {toolUsage.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            Chưa có hoạt động sử dụng AI tools
          </p>
        )}
      </div>

      {/* Credit History */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-6
        "
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          Lịch sử Credits
        </h2>

        <div className="space-y-3">
          {creditHistory.map((transaction) => (
            <div
              key={transaction.id}
              className="
                flex items-center gap-4 p-4 
                bg-slate-800/50 rounded-lg
              "
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center 
                  justify-center flex-shrink-0
                  ${
                    transaction.type === 'add'
                      ? 'bg-green-500/10'
                      : 'bg-red-500/10'
                  }
                `}
              >
                {transaction.type === 'add' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white mb-0.5">
                  {transaction.reason}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(transaction.timestamp).toLocaleString(
                    'vi-VN'
                  )}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p
                  className={`
                    text-sm font-bold
                    ${
                      transaction.type === 'add'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  `}
                >
                  {transaction.type === 'add' ? '+' : ''}
                  {transaction.amount}
                </p>
              </div>
            </div>
          ))}
        </div>

        {creditHistory.length === 0 && (
          <p className="text-center text-slate-400 py-8">
            Chưa có giao dịch credits
          </p>
        )}
      </div>
    </div>
  );
}
