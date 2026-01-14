// AI Tool Types

export type ToolType = 'summary' | 'questions' | 'explain' | 'rewrite';

// Request interfaces (simplified for form submission)
export interface SummaryRequest {
  text: string;
  summaryMode?: 'key_points' | 'easy_read' | 'bullet_list' | 'ultra_short';
  // Deprecated: use summaryMode instead
  focusOnExam?: boolean;
}

export interface QuestionsRequest {
  text: string;
  questionType?: 'mcq' | 'short' | 'true_false' | 'fill_blank';
  count?: number;
  examFocused?: boolean;
}

export interface ExplainRequest {
  text: string;
  mode?: 'easy' | 'exam' | 'friend' | 'deep_analysis';
  withExamples?: boolean;
}

export interface RewriteRequest {
  text: string;
  style?: 'simple' | 'academic' | 'student' | 'practical';
  wordLimit?: number;
}

// AI Response (matches backend format)
export interface AIResponse<T = unknown> {
  success: boolean;
  data?: {
    summary?: string;
    questions?: Question[];
    explanation?: string;
    rewrittenText?: string;
    creditsUsed?: number;
    processingTime?: number;
    remainingCredits?: number;
  };
  result?: T;  // Transformed frontend format
  remainingCredits?: number;
  error?: string;
  message?: string;
}

// Summary Result
export interface SummaryResult {
  summary: string;
}

// Questions Result
export interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export interface QuestionsResult {
  questions: Question[];
}

// Explain Result
export interface ExplainResult {
  explanation: string;
}

// Rewrite Result
export interface RewriteResult {
  rewritten: string;
}

import { ElementType } from 'react';
import { FileText, HelpCircle, Lightbulb, RefreshCw } from 'lucide-react';

// Tool Configuration
export interface ToolConfig {
  id: ToolType;
  name: string;
  description: string;
  creditCost: number;
  icon: ElementType;
  maxLength: number;
  minLength?: number;
  helpText: string;
}

// Default configs (fallback when DB not available)
export const TOOL_CONFIGS: Record<ToolType, ToolConfig> = {
  summary: {
    id: 'summary',
    name: 'AI tóm tắt',
    description: 'Tóm tắt tài liệu dài thành nội dung ngắn gọn',
    creditCost: 1,
    icon: FileText,
    maxLength: 10000, // Updated to match DB default
    minLength: 100,
    helpText: 'Công cụ này giúp bạn:\n• Tóm tắt bài giảng, tài liệu học tập\n• Rút gọn văn bản dài thành nội dung chính\n• Highlight các điểm quan trọng\n\nCách dùng: Paste văn bản cần tóm tắt (100-10,000 ký tự) và nhấn "Tạo kết quả".',
  },
  questions: {
    id: 'questions',
    name: 'AI tạo câu hỏi',
    description: 'Tạo câu hỏi ôn tập từ tài liệu học',
    creditCost: 2,
    icon: HelpCircle,
    maxLength: 8000, // Updated to match DB default
    minLength: 100,
    helpText: 'Công cụ này giúp bạn:\n• Tạo câu hỏi trắc nghiệm, tự luận từ tài liệu\n• Ôn tập hiệu quả với câu hỏi có đáp án\n• Chuẩn bị cho kỳ thi, kiểm tra\n\nCách dùng: Paste nội dung học (100-8,000 ký tự), chọn loại câu hỏi và số lượng.',
  },
  explain: {
    id: 'explain',
    name: 'AI giải thích',
    description: 'Giải thích khái niệm khó dễ hiểu',
    creditCost: 1,
    icon: Lightbulb,
    maxLength: 5000, // Updated to match DB default
    minLength: 50,
    helpText: 'Công cụ này giúp bạn:\n• Giải thích khái niệm phức tạp một cách đơn giản\n• Hiểu rõ kiến thức khó nhằn\n• Có ví dụ cụ thể minh họa\n\nCách dùng: Paste khái niệm hoặc đoạn văn cần giải thích (50-5,000 ký tự).',
  },
  rewrite: {
    id: 'rewrite',
    name: 'AI viết lại',
    description: 'Viết lại nội dung văn phong học thuật',
    creditCost: 1,
    icon: RefreshCw,
    maxLength: 5000, // Updated to match DB default
    minLength: 50,
    helpText: 'Công cụ này giúp bạn:\n• Viết lại văn bản theo phong cách học thuật\n• Cải thiện chất lượng bài viết, báo cáo\n• Đơn giản hóa hoặc nâng cao văn phong\n\nCách dùng: Paste đoạn văn cần viết lại (50-5,000 ký tự) và chọn phong cách mong muốn.',
  },
};

