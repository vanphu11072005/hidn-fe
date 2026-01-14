'use client';

import React from 'react';
import { Copy, Save, Check, Loader2 } from 'lucide-react';

interface ExplainResultProps {
  result: string;
  saved: boolean;
  saving: boolean;
  onSave: () => Promise<void> | void;
  onCopy: () => Promise<void> | void;
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatResultHtml = (value: string) => {
  const escaped = escapeHtml(value);
  const bolded = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return bolded.replace(/\n/g, '<br />');
};

export default function ExplainResult({
  result,
  saved,
  saving,
  onSave,
  onCopy,
}: ExplainResultProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-md p-6 border 
      border-gray-200 animate-in slide-in-from-bottom-4 
      duration-500"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-semibold text-primary flex 
          items-center gap-2"
        >
          <span className="text-green-600">✓</span>
          Kết quả
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saved || saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 
              text-sm rounded-lg transition-all duration-200 ${
              saved
                ? 'bg-green-50 text-green-700 cursor-default'
                : 'hover:bg-blue-50 text-blue-600 hover:scale-105 active:scale-95'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={saved ? 'Đã lưu vào lịch sử' : 'Lưu vào lịch sử'}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Đang lưu...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span className="font-medium">Đã lưu</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="font-medium">Lưu lịch sử</span>
              </>
            )}
          </button>

          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 
              text-sm rounded-lg hover:bg-gray-100 transition-all 
              duration-200 hover:scale-105 active:scale-95"
          >
            <Copy className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700">Copy</span>
          </button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <div
          className="whitespace-pre-wrap text-gray-700 bg-gray-50 
          rounded-lg p-4 border border-gray-200"
          dangerouslySetInnerHTML={{ __html: formatResultHtml(result) }}
        />
      </div>
    </div>
  );
}
