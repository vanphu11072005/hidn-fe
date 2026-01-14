'use client';

import { useState, useRef } from 'react';
import { ChatInput, UploadedFile, FileType, ExplainMode, ExplainSettings } from '@/components/tools';
import { TOOL_CONFIGS, ExplainResult as ExplainResultType } from '@/types/ai.types';
import { aiService } from '@/services/ai';
import { useAuth } from '@/context/AuthContext';
import { useToolConfig } from '@/hooks/useToolConfig';
import { InsufficientCreditsModal } 
  from '@/components/credit/InsufficientCreditsModal';
import historyService from '@/services/history/historyService';
import { Lightbulb, BookOpen, GraduationCap, Users, Microscope } from 'lucide-react';
import ExplainHeader from '@/components/tools/ExplainHeader';
import ExplainResult from '@/components/tools/ExplainResult';

const EXPLAIN_MODES: { 
  value: ExplainMode; 
  label: string; 
  icon: React.ReactNode;
  description: string;
}[] = [
  { 
    value: 'easy', 
    label: 'Dễ hiểu', 
    icon: <Lightbulb className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Giải thích đơn giản nhất'
  },
  { 
    value: 'exam', 
    label: 'Hướng thi', 
    icon: <GraduationCap className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Tập trung điểm quan trọng'
  },
  { 
    value: 'friend', 
    label: 'Như bạn bè', 
    icon: <Users className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Giải thích tự nhiên, gần gũi'
  },
  { 
    value: 'deep_analysis', 
    label: 'Phân tích chuyên sâu', 
    icon: <Microscope className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Đào sâu bản chất'
  },
];

export default function ExplainPage() {
  const { user, refreshCredits } = useAuth();
  const { config } = useToolConfig('explain');
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
  const [mode, setMode] = useState<ExplainMode>('easy');
  const [withExamples, setWithExamples] = useState(true);

  // Store last generation data for save to history
  const [lastGenerationData, setLastGenerationData] = useState<{
    inputText: string;
    outputText: string;
    mode: ExplainMode;
    withExamples: boolean;
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
    const stillExtracting = uploadedFiles.some(f => f.extracting);
    if (stillExtracting) {
      setError('Vui lòng đợi hệ thống xử lý file...');
      return;
    }

    const fileText = uploadedFiles
      .filter(f => f.extractedText && !f.error)
      .map(f => f.extractedText)
      .join('\n\n');

    const finalText = [userPrompt.trim(), fileText.trim()]
      .filter(Boolean)
      .join('\n\n');

    const filesWithErrors = uploadedFiles.filter(f => f.error);
    if (filesWithErrors.length > 0 && !userPrompt.trim()) {
      setError(`${filesWithErrors.length} file không thể xử lý. Vui lòng nhập nội dung hoặc tải file khác.`);
      return;
    }

    // Validate input
    if (!finalText) {
      setError('Vui lòng nhập nội dung cần giải thích');
      return;
    }

    if (finalText.length > config.maxLength) {
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

    try {
      const response = await aiService.explain({
        text: finalText,
        mode,
        withExamples,
      });

      if (response.success && response.result) {
        const explainResult = response.result as ExplainResultType;
        setResult(explainResult.explanation);
        
        // Store generation data for manual save
        setLastGenerationData({
          inputText: finalText,
          outputText: explainResult.explanation,
          mode,
          withExamples,
          creditsUsed: response.data?.creditsUsed || config.creditCost
        });
        setSaved(false);
        
        refreshCredits();
        
        // Clean up uploaded files
        uploadedFiles.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        setUploadedFiles([]);
      } else {
        setError(
          response.message || 
          'Không thể tạo giải thích. Vui lòng thử lại.'
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
        toolType: 'explain',
        inputText: lastGenerationData.inputText,
        outputText: lastGenerationData.outputText,
        settings: { 
          mode: lastGenerationData.mode,
          withExamples: lastGenerationData.withExamples
        },
        creditsUsed: lastGenerationData.creditsUsed
      });
      setSaved(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Không thể lưu vào lịch sử');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = (e.currentTarget as HTMLDivElement).scrollTop;
    if (y > 80) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasEnoughCredits = userCredits >= config.creditCost;

  const MODE_LABELS: Record<ExplainMode, string> = {
    easy: 'Dễ hiểu',
    exam: 'Hướng thi',
    friend: 'Như bạn bè',
    deep_analysis: 'Phân tích chuyên sâu',
  };
  const currentModeLabel = MODE_LABELS[mode];

  // Create explainSettings object for ChatInput
  const explainSettings: ExplainSettings = {
    mode,
    withExamples,
    onModeChange: setMode,
    onWithExamplesChange: setWithExamples,
    modes: EXPLAIN_MODES,
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tool header */}
      <ExplainHeader
        config={config}
        collapsed={collapsed}
        currentModeLabel={currentModeLabel}
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
                <svg 
                  className="w-16 h-16 text-blue-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 
                      12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 
                      9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 
                      0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </div>
              <h3 
                className="text-lg font-semibold text-primary 
                dark:text-white mb-2"
              >
                Sẵn sàng giải thích
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                Dán khái niệm hoặc tải lên tệp để bắt đầu. 
                AI sẽ giải thích theo chế độ bạn chọn.
              </p>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <ExplainResult
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
          placeholder="Nhập khái niệm cần giải thích hoặc thêm file bên dưới..."
          disabled={cooldownRemaining > 0}
          loading={loading}
          maxLength={config.maxLength}
          enableFileUpload={true}
          uploadedFiles={uploadedFiles}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          explainSettings={explainSettings}
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
