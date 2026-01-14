// History Types

export type HistoryToolType = 
  'summary' | 'questions' | 'explain' | 'rewrite';

// History item from list (preview)
export interface HistoryListItem {
  id: number;
  tool_type: HistoryToolType;
  input_preview: string;
  output_preview: string;
  credits_used: number;
  created_at: string;
}

// Full history item
export interface HistoryItem {
  id: number;
  tool_type: HistoryToolType;
  input_text: string;
  output_text: string;
  settings: Record<string, unknown>;
  credits_used: number;
  created_at: string;
}

// API Response Types
export interface HistoryListResponse {
  success: boolean;
  data: {
    items: HistoryListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface HistoryItemResponse {
  success: boolean;
  data: HistoryItem;
}

export interface HistoryDeleteResponse {
  success: boolean;
  message: string;
}
