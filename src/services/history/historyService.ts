import { getSession } from 'next-auth/react';
import type {
  HistoryListItem,
  HistoryItem,
  HistoryListResponse,
  HistoryItemResponse,
  HistoryDeleteResponse,
} from '@/types/history.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getSession();
    if (session && (session as any).accessToken) {
      return (session as any).accessToken;
    }
  } catch (error) {
    console.error('Failed to get session:', error);
  }
  return null;
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}

export const historyService = {
  /**
   * Get paginated history list
   */
  async getHistory(
    page = 1, 
    limit = 20
  ): Promise<HistoryListResponse> {
    return fetchWithAuth<HistoryListResponse>(
      `/history?page=${page}&limit=${limit}`
    );
  },

  /**
   * Get single history item with full content
   */
  async getHistoryItem(id: number): Promise<HistoryItemResponse> {
    return fetchWithAuth<HistoryItemResponse>(`/history/${id}`);
  },

  /**
   * Delete a history item
   */
  async deleteHistoryItem(id: number): Promise<HistoryDeleteResponse> {
    return fetchWithAuth(`/history/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Delete all history
   */
  async deleteAllHistory(): Promise<HistoryDeleteResponse> {
    return fetchWithAuth('/history', {
      method: 'DELETE',
    });
  },

  /**
   * Manually save AI result to history
   */
  async saveToHistory(data: {
    toolType: string;
    inputText: string;
    outputText: string;
    settings?: Record<string, any>;
    creditsUsed?: number;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    return fetchWithAuth('/history/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default historyService;
