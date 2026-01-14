'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  History, 
  FileText, 
  HelpCircle, 
  Lightbulb, 
  RefreshCw,
  Copy,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { historyService } from '@/services/history';
import type { HistoryListItem, HistoryItem } from '@/types/history.types';

// Tool icon map
const toolIcons: Record<string, React.ReactNode> = {
  summary: <FileText className="w-5 h-5" />,
  questions: <HelpCircle className="w-5 h-5" />,
  explain: <Lightbulb className="w-5 h-5" />,
  rewrite: <RefreshCw className="w-5 h-5" />,
};

// Tool label map
const toolLabels: Record<string, string> = {
  summary: 'Tóm tắt',
  questions: 'Câu hỏi',
  explain: 'Giải thích',
  rewrite: 'Viết lại',
};

// Tool color map
const toolColors: Record<string, string> = {
  summary: 'bg-blue-100 text-blue-600',
  questions: 'bg-green-100 text-green-600',
  explain: 'bg-purple-100 text-purple-600',
  rewrite: 'bg-orange-100 text-orange-600',
};

export default function HistoryPage() {
  const router = useRouter();
  
  // List state
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail modal state
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Delete state
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  // Copy state
  const [copied, setCopied] = useState<'input' | 'output' | null>(null);

  // Fetch history list
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await historyService.getHistory(page, 10);
      if (response.success) {
        setItems(response.data.items);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      }
    } catch (err) {
      setError('Không thể tải lịch sử. Vui lòng thử lại.');
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // View detail
  const handleViewDetail = async (id: number) => {
    setLoadingDetail(true);
    setShowDetail(true);
    try {
      const response = await historyService.getHistoryItem(id);
      if (response.success) {
        setSelectedItem(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch history detail:', err);
      setShowDetail(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Delete single item
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleting) return;
    
    setDeleting(id);
    try {
      await historyService.deleteHistoryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      setTotal(prev => prev - 1);
      
      // Close detail if viewing deleted item
      if (selectedItem?.id === id) {
        setShowDetail(false);
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Failed to delete history item:', err);
    } finally {
      setDeleting(null);
    }
  };

  // Delete all
  const handleDeleteAll = async () => {
    if (deletingAll) return;
    
    setDeletingAll(true);
    try {
      await historyService.deleteAllHistory();
      setItems([]);
      setTotal(0);
      setShowDeleteAll(false);
      setShowDetail(false);
      setSelectedItem(null);
    } catch (err) {
      console.error('Failed to delete all history:', err);
    } finally {
      setDeletingAll(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string, type: 'input' | 'output') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Translate setting keys/values to Vietnamese for display
  const translateSetting = (key: string, value: any) => {
    const keyMap: Record<string, string> = {
      style: 'Phong cách',
      mode: 'Chế độ',
      questionType: 'Loại câu hỏi',
      questionCount: 'Số lượng câu',
      withExamples: 'Kèm ví dụ',
      summaryMode: 'Chế độ tóm tắt',
      // fallback keys
      temperature: 'Nhiệt độ',
      maxTokens: 'Giới hạn token',
    };

    const valueMap: Record<string, string> = {
      // rewrite styles
      simple: 'Đơn giản',
      academic: 'Học thuật',
      student: 'Học sinh, sinh viên',
      practical: 'Thực tế',
      // explain modes
      easy: 'Dễ hiểu',
      exam: 'Dạng thi',
      friend: 'Bạn bè',
      deep_analysis: 'Phân tích sâu',
      // summary modes
      key_points: 'Nội dung chính',
      easy_read: 'Dễ đọc',
      bullet_list: 'Gạch đầu dòng',
      ultra_short: 'Rất ngắn',
      // question types
      mcq: 'Trắc nghiệm',
      short: 'Ngắn',
      true_false: 'Đúng/Sai',
      fill_blank: 'Điền vào chỗ trống',
    };

    const prettyKey = keyMap[key] || key.replace(/([A-Z])/g, ' $1')
      .replace(/(^.|\s.)/g, s => s.toUpperCase());

    let prettyValue = '';
    if (typeof value === 'boolean') {
      prettyValue = value ? 'Có' : 'Không';
    } else if (value === null || value === undefined) {
      prettyValue = '-';
    } else if (typeof value === 'string' && valueMap[value]) {
      prettyValue = valueMap[value];
    } else {
      prettyValue = String(value);
    }

    return `${prettyKey}: ${prettyValue}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <History className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary dark:text-white">Lịch sử</h1>
            <p className="text-gray-500 text-sm">
              {total > 0 
                ? `${total} kết quả đã lưu` 
                : 'Chưa có kết quả nào'}
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setShowDeleteAll(true)}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 
              hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:bg-red-900"
          >
            <Trash2 className="w-4 h-4 dark:text-red-400" />
            <span>Xóa tất cả</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 
          flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchHistory}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-20">
          <History className="w-16 h-16 text-gray-300 dark:text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-primary dark:text-white mb-2">
            Chưa có lịch sử
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Sử dụng các công cụ AI để tạo kết quả đầu tiên của bạn
          </p>
          <button
            onClick={() => router.push('/tools/summary')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 
              text-white rounded-lg hover:bg-blue-700 transition-colors dark:focus:ring-0"
          >
            <FileText className="w-4 h-4 mr-2" />
            Bắt đầu với Tóm tắt
          </button>
        </div>
      )}

      {/* History list */}
      {!loading && !error && items.length > 0 && (
        <>
          <div className="bg-white dark:bg-[#0b1620] rounded-xl shadow-sm border 
            border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewDetail(item.id)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-[#0f2a2d] cursor-pointer 
                    transition-colors flex items-center space-x-4"
                >
                  {/* Tool icon */}
                  <div className={`p-2 rounded-lg flex-shrink-0 flex items-center justify-center 
                    ${toolColors[item.tool_type]} dark:bg-gray-800 dark:text-white`}>
                    {toolIcons[item.tool_type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-primary dark:text-white">
                        {toolLabels[item.tool_type]}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.created_at)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-400">•</span>
                      <span className="text-xs text-blue-600 dark:text-blue-300">
                        -{item.credits_used} credits
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {item.input_preview}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-400 truncate mt-1">
                      → {item.output_preview}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    disabled={deleting === item.id}
                    className="p-2 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors 
                      flex-shrink-0 flex items-center justify-center"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500 dark:text-gray-300" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  hover:bg-gray-50 dark:hover:bg-[#0f2a2d] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 dark:text-gray-300" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  disabled:opacity-50 disabled:cursor-not-allowed 
                  hover:bg-gray-50 dark:hover:bg-[#0f2a2d] transition-colors"
              >
                <ChevronRight className="w-5 h-5 dark:text-gray-300" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center 
          justify-center z-60 p-4">
          <div className="bg-white dark:bg-[#0b1620] rounded-xl shadow-xl max-w-2xl w-full 
            max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Modal header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center 
              justify-between">
              {loadingDetail ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="text-gray-500 dark:text-gray-300">Đang tải...</span>
                </div>
              ) : selectedItem && (
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg 
                    ${toolColors[selectedItem.tool_type]}`}>
                    {toolIcons[selectedItem.tool_type]}
                  </div>
                  <div>
                    <h3 className="font-medium text-primary dark:text-white">
                      {toolLabels[selectedItem.tool_type]}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(selectedItem.created_at)}
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedItem(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#12212a] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content */}
            {!loadingDetail && selectedItem && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Input section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Nội dung gốc
                    </h4>
                    <button
                      onClick={() => handleCopy(
                        selectedItem.input_text, 
                        'input'
                      )}
                      className="flex items-center space-x-1 px-2 py-1 
                        text-xs text-gray-500 hover:text-gray-700 
                        hover:bg-gray-100 rounded transition-colors"
                    >
                      {copied === 'input' ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#07151a] rounded-lg p-4 text-sm 
                    text-gray-600 dark:text-gray-200 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedItem.input_text}
                  </div>
                </div>

                {/* Output section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Kết quả
                    </h4>
                    <button
                      onClick={() => handleCopy(
                        selectedItem.output_text, 
                        'output'
                      )}
                      className="flex items-center space-x-1 px-2 py-1 
                        text-xs text-gray-500 hover:text-gray-700 
                        hover:bg-gray-100 rounded transition-colors"
                    >
                      {copied === 'output' ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-blue-50 dark:bg-[#0f2a2d] rounded-lg p-4 text-sm 
                    text-gray-700 dark:text-gray-100 whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedItem.output_text}
                  </div>
                </div>

                {/* Settings info */}
                {selectedItem.settings && 
                 Object.keys(selectedItem.settings).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Cài đặt
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedItem.settings).map(
                        ([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded 
                              text-xs text-gray-600 dark:text-gray-300"
                          >
                            {translateSetting(key, value)}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal footer */}
            {!loadingDetail && selectedItem && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex 
                justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  -{selectedItem.credits_used} credits
                </span>
                <button
                  onClick={() => {
                    if (selectedItem) {
                      handleDelete(
                        selectedItem.id, 
                        { stopPropagation: () => {} } as React.MouseEvent
                      );
                    }
                  }}
                  disabled={deleting === selectedItem?.id}
                  className="flex items-center space-x-2 px-4 py-2 
                    text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg 
                    transition-colors disabled:opacity-50"
                >
                  {deleting === selectedItem?.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-red-600 dark:text-red-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAll && (
        <div className="fixed inset-0 bg-black/50 flex items-center 
          justify-center z-60 p-4">
          <div className="bg-white dark:bg-[#0b1620] rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex 
                items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-primary mb-2">
                Xóa tất cả lịch sử?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Hành động này không thể hoàn tác. Tất cả {total} kết quả 
                sẽ bị xóa vĩnh viễn.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteAll(false)}
                  disabled={deletingAll}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 
                    rounded-lg hover:bg-gray-50 dark:hover:bg-[#0f2a2d] transition-colors 
                    disabled:opacity-50 dark:text-gray-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="flex-1 px-4 py-2 bg-red-600 text-white 
                    rounded-lg hover:bg-red-700 transition-colors 
                    disabled:opacity-50 flex items-center justify-center"
                >
                  {deletingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Xóa tất cả'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
