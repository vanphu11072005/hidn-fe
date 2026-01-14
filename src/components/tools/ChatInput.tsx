"use client";

import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Plus, ArrowUp, X, Loader2, Image as ImageIcon, 
  Paperclip, FileText, File, Check, BookOpen, Brain, List, Scissors } from 'lucide-react';

const MAX_FILES = 5;

export type FileType = 'image' | 'pdf' | 'doc' | 'text' | 'other';

export type SummaryMode = 'key_points' | 'easy_read' | 'bullet_list' | 'ultra_short';

export type QuestionType = 'mcq' | 'short' | 'true_false' | 'fill_blank';

export type ExplainMode = 'easy' | 'exam' | 'friend' | 'deep_analysis';

export type RewriteStyle = 'simple' | 'academic' | 'student' | 'practical';

// Summary mode options are provided by the page that uses `ChatInput`.
// This keeps `ChatInput` decoupled and allows each tool page to
// define its own option set and localized labels/icons.

export interface UploadedFile {
  id: string;
  file: File;
  type: FileType;
  previewUrl?: string; // For image thumbnails
  extractedText?: string;
  extracting?: boolean;
  error?: string;
}

export interface QuestionSettings {
  questionType: QuestionType;
  questionCount: number;
  onQuestionTypeChange: (type: QuestionType) => void;
  onQuestionCountChange: (count: number) => void;
  questionTypes: Array<{
    value: QuestionType;
    label: string;
    icon: React.ReactNode;
    description?: string;
  }>;
  questionCounts: number[];
}

export interface ExplainSettings {
  mode: ExplainMode;
  withExamples: boolean;
  onModeChange: (mode: ExplainMode) => void;
  onWithExamplesChange: (value: boolean) => void;
  modes: Array<{
    value: ExplainMode;
    label: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

export interface RewriteSettings {
  style: RewriteStyle;
  onStyleChange: (style: RewriteStyle) => void;
  styles: Array<{
    value: RewriteStyle;
    label: string;
    icon: React.ReactNode;
    description: string;
  }>;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  
  // Multi-file upload
  enableFileUpload?: boolean;
  uploadedFiles?: UploadedFile[];
  onFileSelect?: (file: File, type: FileType) => void;
  onRemoveFile?: (fileId: string) => void;
  
  // Summary mode selector
  summaryMode?: SummaryMode;
  onSummaryModeChange?: (mode: SummaryMode) => void;
  // Options for summary mode (moved to page level)
  summaryModeOptions?: Array<{
    value: SummaryMode;
    label: string;
    icon: React.ReactNode;
    description?: string;
  }>;
  
  // Question settings
  questionSettings?: QuestionSettings;
  
  // Explain settings
  explainSettings?: ExplainSettings;
  
  // Rewrite settings
  rewriteSettings?: RewriteSettings;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Nhập nội dung...',
  disabled = false,
  loading = false,
  maxLength = 50000,
  enableFileUpload = false,
  uploadedFiles = [],
  onFileSelect,
  onRemoveFile,
  explainSettings,
  rewriteSettings,
  summaryMode = 'key_points',
  onSummaryModeChange,
  summaryModeOptions,
  questionSettings,
}: ChatInputProps) {
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploadLimitError, setUploadLimitError] = useState(false);
  const [modeToast, setModeToast] = useState<{text: string; visible: boolean}>({ text: '', visible: false });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const filesCount = uploadedFiles.length;
  const isAtLimit = filesCount >= MAX_FILES;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 200); // max 200px
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUploadMenu(false);
      }
    };

    if (showUploadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUploadMenu]);

  // Auto-hide upload limit error after 3 seconds
  useEffect(() => {
    if (uploadLimitError) {
      const timer = setTimeout(() => setUploadLimitError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadLimitError]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit) {
        handleSubmit();
      }
    }
  };

  // Wrapper to support sync or async onSubmit, then clear input
  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await Promise.resolve(onSubmit());
    } finally {
      onChange('');
    }
  };

  const detectFileType = (file: File): FileType => {
    // MIME type detection first
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'doc';
    }
    if (file.type === 'text/plain') return 'text';

    // Fallback to extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext || '')) return 'doc';
    if (ext === 'txt') return 'text';
    
    return 'other';
  };

  const handleFileSelectFromInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      // Check file limit before processing
      if (filesCount >= MAX_FILES) {
        setUploadLimitError(true);
        e.target.value = '';
        return;
      }

      const fileType = detectFileType(file);
      onFileSelect(file, fileType);
      setShowUploadMenu(false);
    }
    e.target.value = '';
  };

  const MODE_PLACEHOLDERS: Record<SummaryMode, string> = {
    key_points: 'Dán tài liệu cần tóm tắt nội dung chính…',
    easy_read: 'Dán nội dung để AI tóm tắt dễ hiểu…',
    bullet_list: 'Dán nội dung để AI tóm tắt dạng gạch đầu dòng…',
    ultra_short: 'Dán nội dung dài để rút gọn nhanh…',
  };

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-purple-600" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'text':
        return <File className="w-4 h-4 text-gray-600" />;
      default:
        return <Paperclip className="w-4 h-4 text-gray-600" />;
    }
  };

  const charCount = value.length;
  const isOverLimit = charCount > maxLength;
  const isEmpty = value.trim().length === 0;
  const hasFiles = uploadedFiles && uploadedFiles.length > 0;
  // Allow submit when there's text OR when files are present
  const canSubmit = !disabled && !loading && !isOverLimit && (hasFiles || !isEmpty);

  

  // Clear toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Compute placeholder dynamically:
  // - If questionSettings provided, show placeholder based on question type/count
  // - If explainSettings provided, show placeholder based on explain mode
  // - If rewriteSettings provided, show placeholder based on rewrite style
  // - Otherwise, use summary mode placeholders
  let computedPlaceholder = placeholder;
  if (questionSettings) {
    const typeEntry = questionSettings.questionTypes?.find(
      (t) => t.value === questionSettings.questionType
    );
    const typeLabel = typeEntry?.label ?? 'câu hỏi';
    computedPlaceholder = `Dán tài liệu để tạo ${typeLabel} — ${questionSettings.questionCount} câu…`;
  } else if (explainSettings) {
    const modeEntry = explainSettings.modes?.find(
      (m) => m.value === explainSettings.mode
    );
    const modeLabel = modeEntry?.label ?? 'giải thích';
    computedPlaceholder = `Dán nội dung để giải thích theo phong cách ${modeLabel}…`;
  } else if (rewriteSettings) {
    const styleEntry = rewriteSettings.styles?.find(
      (s) => s.value === rewriteSettings.style
    );
    const styleLabel = styleEntry?.label ?? 'viết lại';
    computedPlaceholder = `Dán nội dung để viết lại theo phong cách ${styleLabel}…`;
  } else {
    computedPlaceholder = MODE_PLACEHOLDERS[summaryMode] ?? placeholder;
  }

  // Align fixed input to main content container to avoid sidebar offset
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const apply = () => {
      const main = document.querySelector('[data-main-content]') as HTMLElement | null;
      if (main) {
        const rect = main.getBoundingClientRect();
        el.style.left = `${rect.left}px`;
        el.style.width = `${rect.width}px`;
        el.style.right = 'auto';
      } else {
        // fallback to full width
        el.style.left = '';
        el.style.width = '';
        el.style.right = '';
      }
    };

    apply();
    window.addEventListener('resize', apply);
    const ro = new ResizeObserver(apply);
    ro.observe(document.body);

    return () => {
      window.removeEventListener('resize', apply);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="fixed bottom-0 z-60 pointer-events-auto left-0 right-0 bg-white dark:bg-[#212121] text-gray-900 dark:text-white pb-2">
      <div className="mx-auto px-4">
        {/* Upload Limit Error */}
        {uploadLimitError && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900 
            border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-800 dark:text-amber-100 animate-in 
            slide-in-from-top-2">
            <span className="font-medium">⚠️</span>
            <span>Bạn chỉ có thể tải lên tối đa 5 tệp hoặc hình ảnh.</span>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="relative">
          {/* Char count on top-right of the input pill */}
          <div className="absolute -top-5 right-3 text-xs text-gray-300">
            {charCount.toLocaleString()}
            {maxLength && ` / ${maxLength.toLocaleString()}`}
          </div>
          
            <div className={`bg-white dark:bg-[#212121] border-2 border-gray-200 dark:border-gray-700 rounded-4xl 
            shadow-sm hover:shadow-md transition-all duration-300 
            focus-within:border-gray-300 dark:focus-within:border-gray-700 focus-within:shadow-none ${
            uploadedFiles.length > 0 ? 'px-3 pt-3 pb-2.5' : 'px-3 py-2'
          }`}>
            
            {/* File Chips - Inside input container */}
            {uploadedFiles.length > 0 && (
              <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {filesCount} tệp đính kèm
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center gap-3 px-3 py-2 
                        bg-white border border-gray-200 rounded-lg 
                        text-sm hover:bg-gray-50 
                        transition-all duration-200 cursor-default 
                        dark:bg-[#0b1620] dark:border-gray-700 dark:hover:bg-[#12212a]"
                    >
                      <div className="flex-shrink-0">
                        {uploadedFile.type === 'image' && uploadedFile.previewUrl ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden 
                            bg-gray-100 dark:bg-gray-700">
                            <img 
                              src={uploadedFile.previewUrl} 
                              alt={uploadedFile.file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border 
                            border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex items-center justify-center">
                            {getFileIcon(uploadedFile.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0 max-w-[220px]">
                        <p className="text-sm font-medium text-gray-900 dark:text-white 
                          truncate leading-tight">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white mt-0.5">
                          {uploadedFile.file.size && 
                            `${(uploadedFile.file.size / 1024).toFixed(0)}KB`}
                        </p>
                      </div>
                      {uploadedFile.extracting && (
                        <Loader2 className="w-4 h-4 animate-spin 
                          text-gray-500 dark:text-white flex-shrink-0" />
                      )}
                      {uploadedFile.error && (
                        <span className="text-sm text-red-400 flex-shrink-0">
                          ⚠️
                        </span>
                      )}
                      {onRemoveFile && !uploadedFile.extracting && (
                        <button
                          onClick={() => onRemoveFile(uploadedFile.id)}
                          className="flex-shrink-0 p-1.5 hover:bg-red-700 
                            rounded transition-all duration-200 
                            hover:scale-110 active:scale-95 group/remove"
                          title="Xoá file"
                        >
                          <X className="w-4 h-4 text-gray-500 dark:text-white group-hover/remove:text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2 min-h-[40px]">
            {enableFileUpload && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => {
                    if (isAtLimit) {
                      setUploadLimitError(true);
                    } else {
                      setShowUploadMenu(!showUploadMenu);
                    }
                  }}
                  disabled={disabled || loading}
                  className={`flex-shrink-0 h-9 w-9 flex items-center justify-center 
                      rounded-full transition-all duration-200 outline-none 
                      ${isAtLimit 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-gray-100 hover:scale-105 active:scale-95 dark:hover:bg-white/6'
                      }
                      ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isAtLimit ? `Đã đạt giới hạn ${MAX_FILES} tệp` : 'Thêm file'}
                >
                  <Plus className="w-6 h-6 text-primary dark:text-white" strokeWidth={1.5} />
                </button>

                {/* Upload Menu Modal */}
                {showUploadMenu && (
                  <div 
                    className="absolute bottom-full left-0 mb-2 w-62 
                    bg-white dark:bg-[#0b1620] rounded-3xl shadow-lg border 
                    border-gray-200 dark:border-gray-700 py-1 z-50 overflow-hidden"
                  >
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-3 py-2.5 text-left text-sm 
                            hover:bg-gray-100 dark:hover:bg-[#12212a] transition-colors flex 
                            items-center gap-3"
                        >
                          <Paperclip 
                            className="w-5 h-5 text-gray-700 dark:text-white" 
                          />
                          <span className="font-medium text-gray-700 dark:text-white">
                            Thêm ảnh và tệp
                          </span>
                        </button>
                    
                    <div className="border-t border-gray-200 my-1" />

                    {/* Summary Mode Options */}
                    {onSummaryModeChange && (
                      <>
                          <div className="px-3 py-2">
                            <p 
                              className="text-sm text-gray-500 dark:text-white 
                              font-medium"
                            >
                              Chế độ tóm tắt
                            </p>
                          </div>

                        {(summaryModeOptions || []).map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setModeToast({ 
                                text: `Đã chọn chế độ: ${option.label}`, 
                                visible: true 
                              });
                              if (toastTimerRef.current) {
                                window.clearTimeout(
                                  toastTimerRef.current
                                );
                              }
                              toastTimerRef.current = 
                                window.setTimeout(() => {
                                setModeToast({ 
                                  text: '', 
                                  visible: false 
                                });
                                toastTimerRef.current = null;
                              }, 1200);

                              onSummaryModeChange?.(option.value);
                              setShowUploadMenu(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-100 
                              dark:hover:bg-[#123033] transition-colors flex items-center gap-3 relative ${
                              summaryMode === option.value
                                ? 'bg-gray-200 text-gray-900 border-l-4 border-gray-300 pl-3 dark:bg-white/6 dark:text-white dark:border-white/10'
                                : ''
                            }`}
                          >
                            <span className="text-lg">
                              {option.icon}
                            </span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-700 dark:text-white">
                                {option.label}
                              </div>
                              {summaryMode === option.value && option.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {option.description}
                                </div>
                              )}
                            </div>
                            {summaryMode === option.value && (
                              <Check 
                                className="w-4 h-4 text-white" 
                                strokeWidth={2.5} 
                              />
                            )}
                          </button>
                        ))}
                      </>
                    )}

                    {/* Question Settings */}
                    {questionSettings && (
                      <>
                        <div className="px-3 py-2 mt-1">
                          <p 
                            className="text-sm text-gray-500 
                            font-medium"
                          >
                            Loại câu hỏi
                          </p>
                        </div>

                        {questionSettings.questionTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              setModeToast({ 
                                text: `Đã chọn: ${type.label}`, 
                                visible: true 
                              });
                              if (toastTimerRef.current) {
                                window.clearTimeout(
                                  toastTimerRef.current
                                );
                              }
                              toastTimerRef.current = 
                                window.setTimeout(() => {
                                setModeToast({ 
                                  text: '', 
                                  visible: false 
                                });
                                toastTimerRef.current = null;
                              }, 1200);

                              questionSettings.onQuestionTypeChange(
                                type.value
                              );
                              setShowUploadMenu(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 
                              dark:hover:bg-[#123033] transition-colors flex items-center gap-3 relative ${
                              questionSettings.questionType === type.value
                                ? 'bg-gray-200 text-gray-900 border-l-4 border-gray-300 pl-3 dark:bg-white/6 dark:text-white dark:border-white/10'
                                : ''
                            }`}
                          >
                            <span className="text-lg">{type.icon}</span>
                            <div className="flex-1">
                              <div className={`font-medium text-primary ${questionSettings.questionType === type.value ? 'dark:text-white' : ''}`}>
                                {type.label}
                              </div>
                              {questionSettings.questionType === type.value && type.description && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {type.description}
                                </div>
                              )}
                            </div>
                            {questionSettings.questionType === 
                              type.value && (
                              <Check 
                                className="w-4 h-4 text-blue-600 dark:text-white" 
                                strokeWidth={2.5} 
                              />
                            )}
                          </button>
                        ))}

                        <div 
                          className="border-t border-gray-200 my-1" 
                        />

                        <div className="px-3 py-2">
                          <p 
                            className="text-sm text-gray-500 
                            font-medium"
                          >
                            Số lượng câu
                          </p>
                        </div>

                        <div 
                          className="px-3 py-2 flex flex-wrap gap-2"
                        >
                          {questionSettings.questionCounts.map((count) => (
                            <button
                              key={count}
                              onClick={() => {
                                setModeToast({ 
                                  text: `Đã chọn: ${count} câu`, 
                                  visible: true 
                                });
                                if (toastTimerRef.current) {
                                  window.clearTimeout(
                                    toastTimerRef.current
                                  );
                                }
                                toastTimerRef.current = 
                                  window.setTimeout(() => {
                                  setModeToast({ 
                                    text: '', 
                                    visible: false 
                                  });
                                  toastTimerRef.current = null;
                                }, 1200);

                                questionSettings.onQuestionCountChange(
                                  count
                                );
                                setShowUploadMenu(false);
                              }}
                              className={`w-12 h-10 rounded-lg text-sm font-medium 
                                transition-colors ${
                                questionSettings.questionCount === count
                                  ? 'bg-gray-200 text-gray-900 dark:bg-white/6 dark:text-white'
                                  : 'bg-gray-100 text-gray-700 dark:bg-[#0b1620] dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#123033]'
                              }`}
                            >
                              {count}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Explain Settings */}
                    {explainSettings && (
                      <>
                        <div className="px-3 py-2 mt-1">
                          <p 
                            className="text-sm text-gray-500 
                            font-medium"
                          >
                            Phong cách giải thích
                          </p>
                        </div>

                        {explainSettings.modes.map((m) => (
                          <button
                            key={m.value}
                            onClick={() => {
                              setModeToast({ 
                                text: `Đã chọn: ${m.label}`, 
                                visible: true 
                              });
                              if (toastTimerRef.current) {
                                window.clearTimeout(
                                  toastTimerRef.current
                                );
                              }
                              toastTimerRef.current = 
                                window.setTimeout(() => {
                                setModeToast({ 
                                  text: '', 
                                  visible: false 
                                });
                                toastTimerRef.current = null;
                              }, 1200);

                              explainSettings.onModeChange(m.value);
                              setShowUploadMenu(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm 
                              hover:bg-gray-50 dark:hover:bg-[#123033] transition-colors flex items-center gap-3 relative ${
                              explainSettings.mode === m.value
                                ? 'bg-gray-200 text-gray-900 border-l-4 border-gray-300 pl-3 dark:bg-white/6 dark:text-white dark:border-white/10'
                                : ''
                            }`}
                          >
                            <span className="text-lg">
                              {m.icon}
                            </span>
                            <div className="flex-1">
                              <div className={`font-medium text-primary ${explainSettings.mode === m.value ? 'dark:text-white' : ''}`}>
                                {m.label}
                              </div>
                              {explainSettings.mode === m.value && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {m.description}
                                </div>
                              )}
                            </div>
                            {explainSettings.mode === m.value && (
                              <Check 
                                className="w-4 h-4 text-blue-600 dark:text-white" 
                                strokeWidth={2.5} 
                              />
                            )}
                          </button>
                        ))}

                        <div 
                          className="border-t border-gray-200 my-1" 
                        />

                        <button
                          onClick={() => {
                            explainSettings.onWithExamplesChange(
                              !explainSettings.withExamples
                            );
                          }}
                          className="w-full px-3 py-2.5 text-left 
                            hover:bg-gray-50 transition-colors 
                            flex items-center gap-3"
                        >
                          <div className="flex-1">
                              <div 
                              className="text-sm font-medium 
                              text-primary"
                            >
                              Kèm ví dụ minh họa
                            </div>
                            <div 
                              className="text-xs text-gray-500 mt-0.5"
                            >
                              Thêm ví dụ thực tế để dễ hiểu hơn
                            </div>
                          </div>
                          <div 
                            className={`w-10 h-6 rounded-full 
                              transition-colors relative ${
                              explainSettings.withExamples 
                                ? 'bg-blue-600' 
                                : 'bg-gray-300'
                            }`}
                          >
                            <div 
                              className={`absolute top-1 left-1 
                                w-4 h-4 rounded-full bg-white 
                                transition-transform ${
                                explainSettings.withExamples 
                                  ? 'translate-x-4' 
                                  : 'translate-x-0'
                              }`} 
                            />
                          </div>
                        </button>
                      </>
                    )}
                    {/* Rewrite Settings */}
                    {rewriteSettings && (
                      <>
                        <div className="px-3 py-2 mt-1">
                          <p 
                            className="text-sm text-gray-500 
                            font-medium"
                          >
                            Phong cách viết
                          </p>
                        </div>

                        {rewriteSettings.styles.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => {
                              setModeToast({ 
                                text: `Đã chọn: ${s.label}`, 
                                visible: true 
                              });
                              if (toastTimerRef.current) {
                                window.clearTimeout(
                                  toastTimerRef.current
                                );
                              }
                              toastTimerRef.current = 
                                window.setTimeout(() => {
                                setModeToast({ 
                                  text: '', 
                                  visible: false 
                                });
                                toastTimerRef.current = null;
                              }, 1200);

                              rewriteSettings.onStyleChange(s.value);
                              setShowUploadMenu(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 
                              dark:hover:bg-[#123033] transition-colors flex items-center gap-3 relative ${
                              rewriteSettings.style === s.value
                                ? 'bg-gray-200 text-gray-900 border-l-4 border-gray-300 pl-3 dark:bg-white/6 dark:text-white dark:border-white/10'
                                : ''
                            }`}
                          >
                            <span className="text-lg">
                              {s.icon}
                            </span>
                            <div className="flex-1">
                              <div className={`font-medium text-primary ${rewriteSettings.style === s.value ? 'dark:text-white' : ''}`}>
                                {s.label}
                              </div>
                              {rewriteSettings.style === s.value && (
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {s.description}
                                </div>
                              )}
                            </div>
                            {rewriteSettings.style === s.value && (
                              <Check 
                                className="w-4 h-4 text-blue-600 dark:text-white" 
                                strokeWidth={2.5} 
                              />
                            )}
                          </button>
                        ))}
                      </>
                    )}                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,.pdf,.doc,.docx"
                  onChange={handleFileSelectFromInput}
                  className="hidden"
                />
              </div>
            )}

            

            <div className="flex-1 min-w-0 flex items-center">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={computedPlaceholder}
                disabled={disabled || loading}
                rows={1}
                className="w-full px-2 pt-[2px] py-0 resize-none border-none 
                  outline-none focus:outline-none bg-transparent text-primary 
                  placeholder:text-gray-500 text-[15px] leading-normal 
                  disabled:cursor-not-allowed"
                style={{ maxHeight: '200px', overflowY: 'auto', minHeight: '24px' }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center 
                justify-center transition-all duration-200 ${
                canSubmit
                  ? 'bg-black hover:bg-gray-800 hover:scale-105 active:scale-95 text-white cursor-pointer dark:bg-white dark:text-black dark:hover:bg-gray-100'
                  : 'bg-gray-400 text-white cursor-not-allowed opacity-60 dark:bg-gray-600 dark:text-white'
              }`}
              title="Gửi"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white dark:text-black" />
              ) : (
                <ArrowUp className="w-5 h-5 text-white dark:text-black" strokeWidth={2.5} />
              )}
            </button>
            </div>
          </div>

          {isOverLimit && (
            <p className="mt-2 px-3 text-xs text-red-600">
              ⚠️ Nội dung vượt quá {maxLength.toLocaleString()} ký tự
            </p>
          )}
        </div>

        {/* Helper caption under input */}
        <div className="mt-2">
          <p className="text-center text-xs text-gray-500 dark:text-white">
            AI giúp tóm tắt — còn hiểu là việc của bạn.
          </p>
        </div>
      </div>

      {/* Mode toast (non-blocking, above input) */}
      <div aria-live="polite" className="pointer-events-none">
        <div className={`absolute bottom-20 left-0 right-0 flex justify-center z-60 px-4`}> 
          <div
            className={`inline-flex items-center gap-2 bg-gray-800 text-white text-sm 
              px-3 py-2 rounded-lg shadow-md transition-all transform 
              ${modeToast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDuration: '220ms' }}
          >
            <span>{modeToast.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
