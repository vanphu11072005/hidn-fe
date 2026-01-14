'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService, type AdminUser } from '@/services/admin';

export default function AdminUsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminService.getUsers({
          search: searchQuery,
          role: roleFilter,
          status: statusFilter,
          page: currentPage,
          limit: itemsPerPage,
        });

        setUsers(response.users);
        setTotalUsers(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, roleFilter, statusFilter, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + users.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          User Management
        </h1>
        <p className="text-sm text-slate-400">
          Quản lý người dùng hệ thống • Tổng: {totalUsers} users
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
              {/* Filters & Search */}
      <div 
        className="
          bg-slate-900 border border-slate-800 
          rounded-lg p-4
        "
      >
        <div 
          className="
            flex flex-col md:flex-row gap-4
          "
        >
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
                placeholder="Tìm kiếm theo email..."
                value={searchQuery}
                onChange={(e) => {
                  handleFilterChange(() => setSearchQuery(e.target.value));
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

          {/* Role Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter 
                className="
                  absolute left-3 top-1/2 -translate-y-1/2 
                  w-4 h-4 text-slate-400 pointer-events-none
                " 
              />
              <select
                value={roleFilter}
                onChange={(e) => {
                  handleFilterChange(() => 
                    setRoleFilter(e.target.value as any)
                  );
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
                <option value="all">Tất cả roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                handleFilterChange(() => 
                  setStatusFilter(e.target.value as any)
                );
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
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>

        {/* Filter summary */}
        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Tìm thấy {totalUsers} kết quả
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('all');
                setStatusFilter('all');
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

      {/* User Table */}
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
                  User
                </th>
                <th 
                  className="
                    px-6 py-3 text-left text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  Role
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
                  Joined
                </th>
                <th 
                  className="
                    px-6 py-3 text-right text-xs 
                    font-semibold text-slate-400 
                    uppercase tracking-wider
                  "
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td 
                    colSpan={6} 
                    className="
                      px-6 py-12 text-center text-slate-400
                    "
                  >
                    Không tìm thấy user nào
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr 
                    key={user.id} 
                    className="
                      hover:bg-slate-800/30 transition-colors
                    "
                  >
                    {/* User Email */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          ID: {user.id}
                        </p>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
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
                    </td>

                    {/* Credits */}
                    <td className="px-6 py-4">
                      <span 
                        className="
                          text-sm font-semibold text-white
                        "
                      >
                        {user.credits.toLocaleString()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
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
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="
                          text-sm text-blue-400 hover:text-blue-300 
                          font-medium transition-colors
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div 
            className="
              px-6 py-4 border-t border-slate-800 
              flex items-center justify-between
            "
          >
            <div className="text-sm text-slate-400">
              Hiển thị {startIndex + 1} - {endIndex} 
              {' '}trong tổng {totalUsers}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first, last, current, and neighbors
                    if (
                      page === 1 ||
                      page === totalPages ||
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
                  }
                )}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
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
        </>
      )}
    </div>
  );
}
