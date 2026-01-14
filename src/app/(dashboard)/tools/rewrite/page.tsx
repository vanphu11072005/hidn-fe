'use client';

import { useState, useRef } from 'react';
import { ChatInput, UploadedFile, FileType, RewriteStyle, RewriteSettings } from '@/components/tools';
import { TOOL_CONFIGS, RewriteResult as RewriteResultType } from '@/types/ai.types';
import { aiService } from '@/services/ai';
import { useAuth } from '@/context/AuthContext';
import { useToolConfig } from '@/hooks/useToolConfig';
import { InsufficientCreditsModal } 
  from '@/components/credit/InsufficientCreditsModal';
import historyService from '@/services/history/historyService';
import { Sparkles, GraduationCap, FileEdit, Target } from 'lucide-react';
import RewriteHeader from '@/components/tools/RewriteHeader';
import RewriteResult from '@/components/tools/RewriteResult';

const REWRITE_STYLES: { 
  value: RewriteStyle; 
  label: string; 
  icon: React.ReactNode;
  description: string;
}[] = [
  { 
    value: 'simple', 
    label: 'Đơn giản', 
    icon: <Sparkles className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Dễ đọc, dễ hiểu'
  },
  { 
    value: 'academic', 
    label: 'Học thuật', 
    icon: <GraduationCap className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Formal, chuyên nghiệp'
  },
  { 
    value: 'student', 
    label: 'Học sinh, sinh viên', 
    icon: <FileEdit className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Tự nhiên, không lộ AI'
  },
  { 
    value: 'practical', 
    label: 'Thực chiến', 
    icon: <Target className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Áp dụng thực tế'
  },
];

export default function RewritePage() {
  const { user, refreshCredits } = useAuth();
  const { config } = useToolConfig('rewrite');
  const userCredits = user?.credits?.totalCredits ?? 0;

  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Header collapsed state
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Multi-file upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Settings
  const [style, setStyle] = useState<RewriteStyle>('student');

  // Store last generation data for save to history
  const [lastGenerationData, setLastGenerationData] = useState<{
    inputText: string;
    outputText: string;
    style: RewriteStyle;
    creditsUsed: number;
  } | null>(null);

  // Insufficient credits modal state
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(
    config.creditCost
  );
  const [creditsAvailable, setCreditsAvailable] = useState(0);

  // Handle unified file selection
  const handleFileSelect = async (file: File, type: FileType) => {
    if (uploadedFiles.length >= 5) {
      setError('Bạn chỉ có thể tải lên tối đa 5 tệp hoặc hình ảnh.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Kích thước file không được vượt quá ${type === 'image' ? '5MB' : '10MB'}`);
      return;
    }

    const fileId = `${Date.now()}-${file.name}`;
    let previewUrl: string | undefined;
    if (type === 'image') {
      previewUrl = URL.createObjectURL(file);
    }

    const newFile: UploadedFile = {
      id: fileId,
      file,
      type,
      previewUrl,
      extracting: true,
    };

    setUploadedFiles(prev => [...prev, newFile]);
    setError(null);

    try {
      let extractedText = '';
      
      if (type === 'image') {
        const response = await aiService.extractTextFromImage(file);
        if (response.success && response.result?.text) {
          extractedText = response.result.text;
        } else {
          throw new Error('Không thể trích xuất text từ ảnh');
        }
      } else {
        const response = await aiService.extractTextFromDocument(file);
        if (response.success && response.result?.text) {
          extractedText = response.result.text;
        } else {
          throw new Error(response.message || 'Không thể trích xuất nội dung từ file');
        }
      }

      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, extractedText, extracting: false }
            : f
        )
      );
    } catch (err: unknown) {
      const error = err as Error;
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, extracting: false, error: error.message }
            : f
        )
      );
      setError(`Lỗi khi xử lý ${file.name}: ${error.message}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async () => {
    // Combine manual text + file extracted text
    const fileTexts = uploadedFiles
      .filter(f => f.extractedText && !f.error)
      .map(f => f.extractedText)
      .join('\n\n');
    const combinedText = [userPrompt.trim(), fileTexts]
      .filter(Boolean)
      .join('\n\n');

    // Validate input
    if (!combinedText) {
      setError('Vui lòng nhập nội dung cần viết lại hoặc tải lên file');
      return;
    }

    if (combinedText.length > config.maxLength) {
      setError('Nội dung vượt quá giới hạn cho phép');
      return;
    }

    // Pre-check credits
    if (userCredits < config.creditCost) {
      setCreditsRequired(config.creditCost);
      setCreditsAvailable(userCredits);
      setShowCreditsModal(true);
      return;
    }

    setError(null);
    setLoading(true);
    setSaved(false);
    setLastGenerationData(null);

    try {
      const response = await aiService.rewrite({
        text: combinedText,
        style,
      });

      if (response.success && response.result) {
        const rewriteResult = response.result as RewriteResultType;
        setResult(rewriteResult.rewritten);
        
        // Store generation data for history
        setLastGenerationData({
          inputText: combinedText,
          outputText: rewriteResult.rewritten,
          style,
          creditsUsed: config.creditCost,
        });
        
        refreshCredits();
        setUploadedFiles([]);
      } else {
        setError(
          response.message || 
          'Không thể viết lại nội dung. Vui lòng thử lại.'
        );
      }
    } catch (err: unknown) {
      const error = err as Error & { 
        code?: string; 
        required?: number; 
        available?: number;
        statusCode?: number;
        remainingSeconds?: number;
      };
      
      // Handle cooldown error
      if (error.statusCode === 429 && error.remainingSeconds) {
        setCooldownRemaining(error.remainingSeconds);
        setError(error.message || `Vui lòng đợi ${error.remainingSeconds} giây`);
        
        // Start countdown timer
        const interval = setInterval(() => {
          setCooldownRemaining(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setError(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return;
      }
      
      if (error.code === 'INSUFFICIENT_CREDITS') {
        setCreditsRequired(error.required ?? config.creditCost);
        setCreditsAvailable(error.available ?? 0);
        setShowCreditsModal(true);
        refreshCredits();
      } else {
        setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    uploadedFiles.forEach(f => {
      if (f.previewUrl) {
        URL.revokeObjectURL(f.previewUrl);
      }
    });
    setUserPrompt('');
    setResult(null);
    setError(null);
    setUploadedFiles([]);
    setSaved(false);
    setLastGenerationData(null);
  };

  const handleSaveToHistory = async () => {
    if (!lastGenerationData || !result) {
      setError('Không có kết quả để lưu');
      return;
    }

    setSaving(true);
    try {
      await historyService.saveToHistory({
        toolType: 'rewrite',
        inputText: lastGenerationData.inputText,
        outputText: lastGenerationData.outputText,
        settings: { 
          style: lastGenerationData.style,
        },
        creditsUsed: lastGenerationData.creditsUsed
      });
      setSaved(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(`Lỗi khi lưu: ${error.message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setCollapsed(target.scrollTop > 50);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const STYLE_LABELS: Record<RewriteStyle, string> = {
    simple: 'Đơn giản',
    academic: 'Học thuật',
    student: 'Sinh viên',
    practical: 'Thực chiến',
  };
  const currentStyleLabel = STYLE_LABELS[style];
  const hasEnoughCredits = userCredits >= config.creditCost;

  // Create rewriteSettings object for ChatInput
  const rewriteSettings: RewriteSettings = {
    style,
    onStyleChange: setStyle,
    styles: REWRITE_STYLES,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tool header */}
      <RewriteHeader
        config={config}
        collapsed={collapsed}
        currentStyleLabel={currentStyleLabel}
        hasEnoughCredits={hasEnoughCredits}
        onSettingsClick={() => {
          const plusBtn = document.querySelector(
            'button[title="Thêm file"]'
          ) as HTMLButtonElement | null;
          if (plusBtn) {
            plusBtn.click();
          } else {
            (
              document.querySelector('textarea') as 
              HTMLTextAreaElement | null
            )?.focus();
          }
        }}
      />

      {/* Content Area - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto" 
        onScroll={handleScroll}
      >
        <div 
          data-main-content 
          className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-56"
        >
          {/* Error Message */}
          {error && (
            <div 
              className="bg-red-50 border border-red-200 
              rounded-lg p-4 text-red-700 text-sm animate-in 
              slide-in-from-top-2 duration-300"
            >
              {error}
            </div>
          )}

          {/* Empty State */}
          {!result && !userPrompt && 
            uploadedFiles.length === 0 && !loading && (
            <div 
              className="flex flex-col items-center 
              justify-center py-16 text-center animate-in 
              fade-in duration-500"
            >
              <div 
                className="mb-4 p-4 bg-gradient-to-br 
                from-blue-50 to-purple-50 rounded-full"
              >
                <config.icon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 
                className="text-xl font-semibold text-primary dark:text-white mb-2"
              >
                Sẵn sàng viết lại
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                Dán nội dung hoặc tải lên tệp để bắt đầu. 
                AI sẽ viết lại theo phong cách bạn chọn.
              </p>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <RewriteResult
              result={result}
              saved={saved}
              saving={saving}
              onSave={handleSaveToHistory}
              onCopy={handleCopy}
            />
          )}
        </div>
      </div>

      {/* Chat Input - Fixed Bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          value={userPrompt}
          onChange={setUserPrompt}
          onSubmit={handleSubmit}
          placeholder="Nhập nội dung cần viết lại hoặc thêm file bên dưới..."
          disabled={cooldownRemaining > 0}
          loading={loading}
          maxLength={config.maxLength}
          enableFileUpload={true}
          uploadedFiles={uploadedFiles}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          rewriteSettings={rewriteSettings}
        />
      </div>

      {/* Credits Modal */}
      <InsufficientCreditsModal
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        required={creditsRequired}
        available={creditsAvailable}
        toolName={config.name}
      />
    </div>
  );
}
