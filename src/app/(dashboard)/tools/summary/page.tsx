'use client';

import { useState, useRef } from 'react';
import { ChatInput, UploadedFile, FileType, SummaryMode } from '@/components/tools';
import { TOOL_CONFIGS, SummaryResult as SummaryResultType } from '@/types/ai.types';
import { aiService } from '@/services/ai';
import { useAuth } from '@/context/AuthContext';
import { useToolConfig } from '@/hooks/useToolConfig';
import { InsufficientCreditsModal } 
  from '@/components/credit/InsufficientCreditsModal';
import historyService from '@/services/history/historyService';
import { 
  Loader2, 
  Copy, 
  Check, 
  RotateCcw,
  Zap,
  HelpCircle,
  ChevronDown,
  Save,
  BookOpen,
  Brain,
  List,
  Scissors,
} from 'lucide-react';
import { Tooltip } from '@/components/common';
import SummaryHeader from '@/components/tools/SummaryHeader';
import SummaryResult from '@/components/tools/SummaryResult';

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

export default function SummaryPage() {
  const { user, refreshCredits } = useAuth();
  const { config } = useToolConfig('summary');
  const userCredits = user?.credits?.totalCredits ?? 0;

  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  // Header collapsed state (when scrolling up)
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Multi-file upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Summary mode setting
  const [summaryMode, setSummaryMode] = useState<SummaryMode>('key_points');

  // Summary mode options (moved to page for clearer ownership)
  const SUMMARY_MODE_OPTIONS = [
    {
      value: 'key_points' as const,
      label: 'Tập trung nội dung chính',
      icon: <BookOpen className="w-5 h-5 text-gray-700 dark:text-white" />,
      description: 'Trọng tâm bài',
    },
    {
      value: 'easy_read' as const,
      label: 'Tóm tắt dễ hiểu',
      icon: <Brain className="w-5 h-5 text-gray-700 dark:text-white" />,
      description: 'Dễ hiểu, dễ nhớ',
    },
    {
      value: 'bullet_list' as const,
      label: 'Gạch đầu dòng – dễ học',
      icon: <List className="w-5 h-5 text-gray-700 dark:text-white" />,
      description: 'Chia ý ngắn gọn để ôn tập',
    },
    {
      value: 'ultra_short' as const,
      label: 'Rút gọn tối đa',
      icon: <Scissors className="w-5 h-5 text-gray-700 dark:text-white" />,
      description: 'Ngắn nhất, giữ ý cốt lõi',
    },
  ];

  // Store last generation data for save to history
  const [lastGenerationData, setLastGenerationData] = useState<{
    inputText: string;
    outputText: string;
    mode: SummaryMode;
    creditsUsed: number;
  } | null>(null);

  // Insufficient credits modal state
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(
    config.creditCost
  );
  const [creditsAvailable, setCreditsAvailable] = useState(0);

  // Handle unified file selection (both images and documents)
  const handleFileSelect = async (file: File, type: FileType) => {
    // Validate file limit (max 5 files)
    if (uploadedFiles.length >= 5) {
      setError('Bạn chỉ có thể tải lên tối đa 5 tệp hoặc hình ảnh.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate file size (max 10MB for documents, 5MB for images)
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`Kích thước file không được vượt quá ${type === 'image' ? '5MB' : '10MB'}`);
      return;
    }

    const fileId = `${Date.now()}-${file.name}`;
    
    // Generate preview URL for images
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

    // Extract text based on file type
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
        // For PDF, DOC, and other documents
        console.log('Uploading document:', file.name, file.type, file.size);
        const response = await aiService.extractTextFromDocument(file);
        console.log('Document extraction response:', response);
        if (response.success && response.result?.text) {
          extractedText = response.result.text;
        } else {
          console.error('Extraction failed:', response);
          throw new Error(response.message || 'Không thể trích xuất nội dung từ file');
        }
      }

      // Update file with extracted text
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, extractedText, extracting: false }
            : f
        )
      );
    } catch (err: unknown) {
      const error = err as Error;
      console.error('File extraction error:', error);
      const errorMessage = error.message || 'Không thể trích xuất nội dung';
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? { ...f, extracting: false, error: errorMessage }
            : f
        )
      );
      // Show error notification but don't block the file from being uploaded
      setError(`Lỗi khi xử lý ${file.name}: ${errorMessage}`);
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    // Find the file and revoke preview URL if it exists
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.previewUrl) {
      URL.revokeObjectURL(fileToRemove.previewUrl);
    }
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async () => {
    // Check if any files are still extracting
    const stillExtracting = uploadedFiles.some(f => f.extracting);
    if (stillExtracting) {
      setError('Vui lòng đợi hệ thống xử lý file...');
      return;
    }

    // Combine extracted text from successfully processed files
    const fileText = uploadedFiles
      .filter(f => f.extractedText && !f.error)
      .map(f => f.extractedText)
      .join('\n\n');

    // Determine final text to send: user prompt + file content
    const finalText = [userPrompt.trim(), fileText.trim()]
      .filter(Boolean)
      .join('\n\n');

    // Check if there are files with errors
    const filesWithErrors = uploadedFiles.filter(f => f.error);
    if (filesWithErrors.length > 0 && !userPrompt.trim()) {
      setError(`${filesWithErrors.length} file không thể xử lý. Vui lòng nhập nội dung hoặc tải file khác.`);
      return;
    }

    // Validate input
    if (!finalText) {
      setError('Vui lòng nhập nội dung hoặc upload file cần tóm tắt');
      return;
    }

    if (finalText.length > config.maxLength) {
      setError('Nội dung vượt quá giới hạn cho phép');
      return;
    }

    // Pre-check credits (frontend validation)
    if (userCredits < config.creditCost) {
      setCreditsRequired(config.creditCost);
      setCreditsAvailable(userCredits);
      setShowCreditsModal(true);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await aiService.summarize({
        text: finalText,
        summaryMode,
      });

      if (response.success && response.result) {
        const summaryResult = response.result as SummaryResultType;
        setResult(summaryResult.summary);
        
        // Store generation data for manual save
        setLastGenerationData({
          inputText: finalText,
          outputText: summaryResult.summary,
          mode: summaryMode,
          creditsUsed: response.data?.creditsUsed || config.creditCost
        });
        setSaved(false); // Reset saved state for new result
        
        // Refresh credits after successful operation
        refreshCredits();
        // Clean up uploaded file previews and clear files after successful submit
        uploadedFiles.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        setUploadedFiles([]);
      } else {
        setError(
          response.message || 
          'Không thể tạo tóm tắt. Vui lòng thử lại.'
        );
      }
    } catch (err: unknown) {
      // Handle insufficient credits error from API
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
        // Refresh credits to sync with server
        refreshCredits();
      } else {
        setError(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Clean up all preview URLs
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
        toolType: 'summary',
        inputText: lastGenerationData.inputText,
        outputText: lastGenerationData.outputText,
        settings: { mode: lastGenerationData.mode },
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
    // collapse when scrolled beyond threshold
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
  const charCount = userPrompt.length;

  const MODE_LABELS: Record<string, string> = {
    key_points: 'Tập trung nội dung chính',
    easy_read: 'Tóm tắt dễ hiểu',
    bullet_list: 'Gạch đầu dòng – dễ học',
    ultra_short: 'Rút gọn tối đa',
  };
  const currentModeLabel = MODE_LABELS[summaryMode] ?? MODE_LABELS.key_points;

  return (
    <div className="flex flex-col h-full min-h-0">
          {/* Tool header - stick to top of main content (not viewport) */}
          <SummaryHeader
            config={config}
            collapsed={collapsed}
            currentModeLabel={currentModeLabel}
            hasEnoughCredits={hasEnoughCredits}
          />

      {/* Content Area - Scrollable (fills remaining height) */}
      <div className="flex-1 overflow-y-auto">
        <div data-main-content className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-56">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 
              rounded-lg p-4 text-red-700 text-sm animate-in 
              slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          {/* Empty State - Show when no result and no input */}
          {!result && !userPrompt && uploadedFiles.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center 
              py-16 text-center animate-in fade-in duration-500">
              <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 
                to-purple-50 rounded-full">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary dark:text-white mb-2">
                Sẵn sàng tóm tắt nội dung
              </h3>
              <p className="text-gray-600 dark:text-white text-sm max-w-md">
                Dán văn bản hoặc tải lên tệp để bắt đầu. 
                AI sẽ tóm tắt theo chế độ bạn chọn.
              </p>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <SummaryResult
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
          placeholder="Nhập yêu cầu của bạn hoặc thêm file bên dưới..."
          disabled={cooldownRemaining > 0}
          loading={loading}
          maxLength={config.maxLength}
          enableFileUpload={true}
          uploadedFiles={uploadedFiles}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          summaryMode={summaryMode}
          onSummaryModeChange={setSummaryMode}
          summaryModeOptions={SUMMARY_MODE_OPTIONS}
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
