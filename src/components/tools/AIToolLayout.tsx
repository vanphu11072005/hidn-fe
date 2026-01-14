'use client';

import { ReactNode } from 'react';
import { 
  Loader2, 
  Copy, 
  Check, 
  RotateCcw,
  Coins,
  HelpCircle,
} from 'lucide-react';
import { Button, Tooltip } from '@/components/common';
import { ToolConfig } from '@/types/ai.types';
import { useState } from 'react';

interface AIToolLayoutProps {
  // Tool config
  config: ToolConfig;
  
  // Input
  text: string;
  onTextChange: (text: string) => void;
  placeholder?: string;
  inputSlot?: ReactNode; // Custom input slot (e.g., image upload)
  disableTextarea?: boolean; // Disable textarea when using image
  
  // Settings slot (custom settings per tool)
  settingsSlot?: ReactNode;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Result
  result: string | null;
  customResultRenderer?: () => ReactNode;
  
  // Actions
  onSubmit: () => void;
  onReset: () => void;
  submitLabel?: string;
  
  // Credits
  userCredits: number;
}

export function AIToolLayout({
  config,
  text,
  onTextChange,
  placeholder = 'Dán nội dung của bạn vào đây...',
  inputSlot,
  disableTextarea = false,
  settingsSlot,
  loading,
  error,
  result,
  customResultRenderer,
  onSubmit,
  onReset,
  submitLabel,
  userCredits,
}: AIToolLayoutProps) {
  const [copied, setCopied] = useState(false);

  const charCount = text.length;
  const isOverLimit = charCount > config.maxLength;
  const isEmpty = text.trim().length === 0;
  const hasEnoughCredits = userCredits >= config.creditCost;

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canSubmit = !loading && !isEmpty && !isOverLimit && hasEnoughCredits;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
              {/** render icon component from config */}
              <div className="text-3xl">
                {config.icon && (
                  // config.icon is an ElementType
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  <config.icon className="w-8 h-8 dark:text-white" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-primary">
                {config.name}
              </h1>
            </div>

          <div className="flex items-center">
            <Tooltip content={config.helpText} position="left">
              <HelpCircle
                className="w-6 h-6 text-gray-700 dark:text-white cursor-help hover:text-primary dark:hover:text-white transition-colors"
                strokeWidth={1.6}
              />
            </Tooltip>
          </div>
        </div>
        <p className="text-gray-600">{config.description}</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Coins className="w-4 h-4 dark:text-white" />
          <span>
            Chi phí: <strong>{config.creditCost} credit</strong>
          </span>
          {!hasEnoughCredits && (
            <span className="text-red-600 ml-2">(Không đủ credits)</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Nhập nội dung của bạn
            </label>
            <div className="flex items-center gap-2 text-sm">
              <span className={`${
                isOverLimit ? 'text-red-600' : 'text-gray-500'
              }`}>
                {charCount.toLocaleString()} / 
                {config.maxLength.toLocaleString()} ký tự
              </span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={placeholder}
            disabled={loading || disableTextarea}
            className={`w-full min-h-[200px] px-4 py-3 border 
              rounded-lg resize-y focus:outline-none focus:ring-2 
              focus:ring-blue-500 transition-colors
              ${isOverLimit 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
              }
              ${loading || disableTextarea 
                ? 'bg-gray-50 cursor-not-allowed' 
                : ''
              }
            `}
          />

          {isOverLimit && (
            <p className="mt-2 text-sm text-red-600">
              ⚠️ Nội dung vượt quá giới hạn cho phép
            </p>
          )}

          {/* Custom input slot (e.g., image upload) - placed below textarea */}
          {inputSlot && (
            <div className="mt-4">
              {inputSlot}
            </div>
          )}
        </div>

        {/* Settings Section */}
        {settingsSlot && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Tuỳ chọn
            </h3>
            {settingsSlot}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 
            rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={loading || (isEmpty && !result)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Xoá tất cả
            </Button>
            
            <Button
              variant="primary"
              onClick={onSubmit}
              disabled={!canSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                submitLabel || 'Tạo kết quả'
              )}
            </Button>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6 
            border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-primary">
                ✅ Kết quả
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-green-600">Đã copy</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            {customResultRenderer ? (
              customResultRenderer()
            ) : (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 
                  bg-gray-50 rounded-lg p-4 max-h-[400px] 
                  overflow-y-auto">
                  {result}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
