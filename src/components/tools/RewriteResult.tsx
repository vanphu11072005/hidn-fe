'use client';

import React, { useState } from 'react';
import { Copy, Check, Save, Loader2 } from 'lucide-react';

interface RewriteResultProps {
  result: string;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
  onCopy: () => void;
}

export default function RewriteResult({
  result,
  saved,
  saving,
  onSave,
  onCopy,
}: RewriteResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border 
        border-gray-200 overflow-hidden animate-in 
        slide-in-from-bottom-4 duration-500"
    >
      {/* Result Header */}
      <div
        className="flex items-center justify-between 
          px-4 py-3 bg-gradient-to-r from-blue-50 
          to-purple-50 border-b border-gray-200"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 bg-green-500 rounded-full 
              animate-pulse"
          />
          <span className="text-sm font-medium text-gray-700">
            Nội dung đã viết lại
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 
              text-sm text-gray-700 hover:text-blue-600 
              hover:bg-white rounded-lg transition-all"
            title="Sao chép"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          <button
            onClick={onSave}
            disabled={saving || saved}
            className="flex items-center gap-1.5 px-3 py-1.5 
              text-sm text-white bg-blue-600 hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed 
              rounded-lg transition-all"
            title={saved ? 'Đã lưu' : 'Lưu vào lịch sử'}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu lịch sử</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Content */}
      <div className="p-6">
        <div
          className="prose prose-sm max-w-none text-gray-800 
            leading-relaxed whitespace-pre-wrap"
        >
          {result}
        </div>
      </div>
    </div>
  );
}
