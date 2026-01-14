import { 
  SummaryRequest, 
  SummaryResult,
  QuestionsRequest,
  QuestionsResult,
  ExplainRequest,
  ExplainResult,
  RewriteRequest,
  RewriteResult,
  AIResponse 
} from '@/types/ai.types';
import { getSession } from 'next-auth/react';

// API URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  'http://localhost:5000';

// =========================================
// API HELPERS
// =========================================

interface ApiErrorResponse {
  success: false;
  message: string;
  required?: number;
  available?: number;
}

async function getAuthToken(): Promise<string | null> {
  // Try to get token from NextAuth session first
  try {
    const session = await getSession();
    if (session && (session as any).accessToken) {
      return (session as any).accessToken;
    }
  } catch (error) {
    console.error('Failed to get session:', error);
  }

  // Fallback to localStorage for backward compatibility
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  
  return null;
}

async function fetchWithAuth<T>(
  endpoint: string, 
  body: object | FormData
): Promise<AIResponse<T>> {
  const token = await getAuthToken();

  const isFormData = body instanceof FormData;
  
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    method: 'POST',
    headers: {
      ...((!isFormData) && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: isFormData ? body : JSON.stringify(body),
  });

  const data = await response.json();

  // Handle insufficient credits (402)
  if (response.status === 402) {
    const errorData = data as ApiErrorResponse;
    const error = new Error(errorData.message) as Error & {
      code: string;
      required: number;
      available: number;
    };
    error.code = 'INSUFFICIENT_CREDITS';
    error.required = errorData.required ?? 0;
    error.available = errorData.available ?? 0;
    throw error;
  }

  // Handle other errors
  if (!response.ok) {
    throw new Error(
      data.message || 'Có lỗi xảy ra khi xử lý yêu cầu'
    );
  }

  return data;
}

// =========================================
// AI SERVICE FUNCTIONS
// =========================================

export const aiService = {
  /**
   * Generate a summary of the given text
   */
  async summarize(
    request: SummaryRequest
  ): Promise<AIResponse<SummaryResult>> {
    const response = await fetchWithAuth<{
      summary: string;
      creditsUsed: number;
      processingTime: number;
      remainingCredits: number;
    }>('/ai/summary', {
      text: request.text,
      mode: request.focusOnExam ? 'exam_focused' : 'normal',
    });

    // Transform backend response to frontend format
    return {
      success: response.success,
      result: {
        summary: response.data?.summary || '',
      },
      remainingCredits: response.data?.remainingCredits,
    };
  },

  /**
   * Generate Q&A from the given text
   */
  async generateQuestions(
    request: QuestionsRequest
  ): Promise<AIResponse<QuestionsResult>> {
    const response = await fetchWithAuth<{
      questions: Array<{
        question: string;
        options?: string[];
        answer: string;
        explanation?: string;
      }>;
      creditsUsed: number;
      processingTime: number;
      remainingCredits: number;
    }>('/ai/questions', {
      text: request.text,
      questionType: request.questionType || 'mcq',
      count: request.count || 5,
    });

    return {
      success: response.success,
      result: {
        questions: response.data?.questions || [],
      },
      remainingCredits: response.data?.remainingCredits,
    };
  },

  /**
   * Explain the given text
   */
  async explain(
    request: ExplainRequest
  ): Promise<AIResponse<ExplainResult>> {
    const response = await fetchWithAuth<{
      explanation: string;
      creditsUsed: number;
      processingTime: number;
      remainingCredits: number;
    }>('/ai/explain', {
      text: request.text,
      mode: request.mode || 'easy',
      withExamples: request.withExamples ?? true,
    });

    return {
      success: response.success,
      result: {
        explanation: response.data?.explanation || '',
      },
      remainingCredits: response.data?.remainingCredits,
    };
  },

  /**
   * Rewrite the given text
   */
  async rewrite(
    request: RewriteRequest
  ): Promise<AIResponse<RewriteResult>> {
    const response = await fetchWithAuth<{
      rewrittenText: string;
      creditsUsed: number;
      processingTime: number;
      remainingCredits: number;
    }>('/ai/rewrite', {
      text: request.text,
      style: request.style || 'simple',
      wordLimit: request.wordLimit,
    });

    return {
      success: response.success,
      result: {
        rewritten: response.data?.rewrittenText || '',
      },
      remainingCredits: response.data?.remainingCredits,
    };
  },

  /**
   * Extract text from image using OCR
   */
  async extractTextFromImage(
    imageFile: File
  ): Promise<AIResponse<{ text: string }>> {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetchWithAuth<{
      text: string;
      processingTime?: number;
    }>('/ai/extract-text', formData);

    return {
      success: response.success,
      result: {
        text: (response.data as any)?.text || '',
      },
    };
  },

  /**
   * Extract text from document (PDF, DOCX)
   */
  async extractTextFromDocument(
    documentFile: File
  ): Promise<AIResponse<{ text: string }>> {
    const formData = new FormData();
    formData.append('document', documentFile);

    const response = await fetchWithAuth<{
      text: string;
      processingTime?: number;
      fileType?: string;
    }>('/ai/extract-document', formData);

    return {
      success: response.success,
      result: {
        text: (response.data as any)?.text || '',
      },
    };
  },
};

export default aiService;
