'use client';

import { useState, useRef } from 'react';
import { ChatInput, UploadedFile, FileType } from '@/components/tools';
import { TOOL_CONFIGS, QuestionsResult as QuestionsResultType, Question } from '@/types/ai.types';
import { aiService } from '@/services/ai';
import { List, Edit3, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToolConfig } from '@/hooks/useToolConfig';
import { InsufficientCreditsModal } 
  from '@/components/credit/InsufficientCreditsModal';
import historyService from '@/services/history/historyService';
import QuestionsHeader from '@/components/tools/QuestionsHeader';
import QuestionsResult from '@/components/tools/QuestionsResult';

type QuestionType = 'mcq' | 'short' | 'true_false' | 'fill_blank';

const QUESTION_TYPES: { 
  value: QuestionType; 
  label: string; 
  icon: React.ReactNode; 
  description?: string;
}[] = [
  {
    value: 'mcq',
    label: 'Trắc nghiệm',
    icon: <List className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Chọn đáp án đúng',
  },
  {
    value: 'short',
    label: 'Tự luận ngắn',
    icon: <Edit3 className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Trả lời ngắn gọn',
  },
  {
    value: 'true_false',
    label: 'Đúng / Sai',
    icon: <CheckCircle className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Xác định đúng hoặc sai',
  },
  {
    value: 'fill_blank',
    label: 'Điền vào chỗ trống',
    icon: <FileText className="w-5 h-5 text-gray-700 dark:text-white" />,
    description: 'Điền từ khóa quan trọng',
  },
];

const QUESTION_COUNTS = [3, 5, 7, 10];

export default function QuestionsPage() {
  const { user, refreshCredits } = useAuth();
  const { config } = useToolConfig('questions');
  const userCredits = user?.credits?.totalCredits ?? 0;

  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Header collapsed state (when scrolling up)
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  
  // Multi-file upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Settings
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [questionCount, setQuestionCount] = useState(5);

  // Store last generation data for save to history
  const [lastGenerationData, setLastGenerationData] = useState<{
    inputText: string;
    outputText: string;
    questionType: QuestionType;
    questionCount: number;
    creditsUsed: number;
  } | null>(null);

  // Insufficient credits modal state
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(
    config.creditCost
  );
  const [creditsAvailable, setCreditsAvailable] = useState(0);

  // Show/hide answers
  const [showAnswers, setShowAnswers] = useState(false);

  // Handle unified file selection
  const handleFileSelect = async (file: File, type: FileType) => {
    // Validate file limit (max 5 files)
    if (uploadedFiles.length >= 5) {
      setError('Bạn chỉ có thể tải lên tối đa 5 tệp hoặc hình ảnh.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate file size
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
        const response = await aiService.extractTextFromDocument(file);
        if (response.success && response.result?.text) {
          extractedText = response.result.text;
        } else {
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

    // Determine final text to send
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
      setError('Vui lòng nhập nội dung hoặc upload file để tạo câu hỏi');
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
    setQuestions([]);
    setShowAnswers(false);

    try {
      const response = await aiService.generateQuestions({
        text: finalText,
        questionType,
        count: questionCount,
      });

      if (response.success && response.result) {
        const qResult = response.result as QuestionsResultType;
        setQuestions(qResult.questions || []);
        
        // Format questions as text for history
        const outputText = formatQuestionsAsText(
          qResult.questions || []
        );
        
        // Store generation data for manual save
        setLastGenerationData({
          inputText: finalText,
          outputText,
          questionType,
          questionCount,
          creditsUsed: response.data?.creditsUsed || config.creditCost
        });
        setSaved(false);
        
        // Refresh credits after successful operation
        refreshCredits();
        
        // Clean up uploaded file previews and clear files
        uploadedFiles.forEach(f => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        setUploadedFiles([]);
      } else {
        setError(
          response.message || 
          'Không thể tạo câu hỏi. Vui lòng thử lại.'
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
    setQuestions([]);
    setError(null);
    setShowAnswers(false);
    setUploadedFiles([]);
    setSaved(false);
    setLastGenerationData(null);
  };

  const handleSaveToHistory = async () => {
    if (!lastGenerationData || questions.length === 0) {
      setError('Không có kết quả để lưu');
      return;
    }

    setSaving(true);
    try {
      await historyService.saveToHistory({
        toolType: 'questions',
        inputText: lastGenerationData.inputText,
        outputText: lastGenerationData.outputText,
        settings: { 
          questionType: lastGenerationData.questionType,
          questionCount: lastGenerationData.questionCount,
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
    // collapse when scrolled beyond threshold
    if (y > 80) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  };

  const handleCopy = async () => {
    if (questions.length > 0) {
      const text = formatQuestionsAsText(questions);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format questions as text for copy
  const formatQuestionsAsText = (qs: Question[]): string => {
    return qs.map((q, i) => {
      let text = `${i + 1}. ${q.question}\n`;
      
      if (q.options && q.options.length > 0) {
        q.options.forEach((opt, j) => {
          const letter = String.fromCharCode(65 + j);
          text += `   ${letter}. ${opt}\n`;
        });
      }
      
      text += `\n   ĐÁP ÁN: ${q.answer}`;
      
      if (q.explanation) {
        text += `\n   GIẢI THÍCH: ${q.explanation}`;
      }
      
      return text;
    }).join('\n\n');
  };

  const hasEnoughCredits = userCredits >= config.creditCost;

  const TYPE_LABELS: Record<QuestionType, string> = {
    mcq: 'Trắc nghiệm',
    short: 'Tự luận ngắn',
    true_false: 'Đúng / Sai',
    fill_blank: 'Điền vào chỗ trống',
  };
  const currentTypeLabel = TYPE_LABELS[questionType];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tool header - stick to top of main content */}
      <QuestionsHeader
        config={config}
        collapsed={collapsed}
        currentTypeLabel={currentTypeLabel}
        questionCount={questionCount}
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
          {!questions.length && !userPrompt && 
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
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 
                      2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 
                      2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 
                      12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 
                className="text-lg font-semibold text-primary 
                dark:text-white mb-2"
              >
                Sẵn sàng tạo câu hỏi
              </h3>
              <p className="text-gray-500 text-sm max-w-md">
                Dán văn bản hoặc tải lên tệp để bắt đầu. 
                AI sẽ tạo câu hỏi theo chế độ bạn chọn.
              </p>
            </div>
          )}

          {/* Result Section */}
          {questions.length > 0 && (
            <QuestionsResult
              questions={questions}
              questionType={questionType}
              showAnswers={showAnswers}
              onToggleAnswers={() => setShowAnswers(!showAnswers)}
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
          placeholder="Nhập nội dung để tạo câu hỏi hoặc thêm file bên dưới..."
          disabled={cooldownRemaining > 0}
          loading={loading}
          maxLength={config.maxLength}
          enableFileUpload={true}
          uploadedFiles={uploadedFiles}
          onFileSelect={handleFileSelect}
          onRemoveFile={handleRemoveFile}
          questionSettings={{
            questionType,
            questionCount,
            onQuestionTypeChange: setQuestionType,
            onQuestionCountChange: setQuestionCount,
            questionTypes: QUESTION_TYPES,
            questionCounts: QUESTION_COUNTS,
          }}
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
