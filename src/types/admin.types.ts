/**
 * Admin Service Types
 * Types for admin dashboard, user management, and system logs
 */

// ===================== User Management =====================

export interface AdminUser {
  id: number;
  email: string;
  role: 'user' | 'admin';
  credits: number;
  status: 'active' | 'banned';
  createdAt: string;
}

export interface GetUsersParams {
  search?: string;
  role?: 'all' | 'user' | 'admin';
  status?: 'all' | 'active' | 'banned';
  page?: number;
  limit?: number;
}

export interface GetUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreditTransaction {
  id: number;
  amount: number;
  type: 'add' | 'subtract';
  reason: string;
  timestamp: string;
}

export interface ToolUsage {
  toolName: string;
  usageCount: number;
  creditsSpent: number;
}

export interface AdminUserDetail extends AdminUser {
  lastLogin: string;
  creditHistory: CreditTransaction[];
  toolUsage: ToolUsage[];
}

// ===================== Credit Logs =====================

export interface CreditLog {
  id: number;
  userId: number;
  userEmail: string;
  toolName: string;
  creditsUsed: number;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface GetCreditLogsParams {
  search?: string;
  toolType?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GetCreditLogsResponse {
  logs: CreditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===================== Credit Configuration =====================

export interface ToolPricing {
  toolId: string;
  toolName: string;
  creditCost: number;
  description: string;
}

export interface BonusConfig {
  enabled: boolean;
  amount: number;
  reason: string;
  validUntil: string;
}

export interface CreditConfig {
  toolPricing: ToolPricing[];
  dailyFreeCredits: number;
  bonusConfig: BonusConfig;
}

// ===================== Tool Analytics =====================

export interface ToolAnalytics {
  toolId: string;
  toolName: string;
  totalUsage: number;
  totalCreditsSpent: number;
  avgCreditsPerUse: number;
  successRate: number;
  popularityRank: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface AdminToolConfig {
  tool_id: string;
  tool_name: string;
  description: string;
  enabled: number;
  min_chars: number;
  max_chars: number;
  cooldown_seconds: number;
  cost_multiplier: number;
  model_provider: string;
  model_name: string;
}

// ===================== Security Logs =====================

export type SecurityEventType =
  | 'failed_login'
  | 'password_reset_spam'
  | 'credit_abuse'
  | 'tool_spam'
  | 'suspicious_activity'
  | 'rate_limit_exceeded';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface SecurityLog {
  id: number;
  timestamp: Date;
  eventType: SecurityEventType;
  riskLevel: RiskLevel;
  description: string;
  userId?: number;
  userEmail?: string;
  ipAddress: string;
  userAgent?: string;
  metadata?: {
    attemptCount?: number;
    timeWindow?: string;
    toolsUsed?: string[];
    creditsSpent?: number;
    endpoint?: string;
    [key: string]: any;
  };
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: number;
  notes?: string;
  createdAt: Date;
}

export interface GetSecurityLogsParams {
  search?: string;
  eventType?: SecurityEventType | 'all';
  riskLevel?: RiskLevel | 'all';
  resolved?: boolean;
  page?: number;
  limit?: number;
}

export interface GetSecurityLogsResponse {
  logs: SecurityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SecurityStats {
  total: number;
  unresolved: number;
  high: number;
  medium: number;
  byType: {
    [key: string]: number;
  };
}

// ===================== System Logs =====================

export type SystemLogLevel = 'error' | 'warning' | 'info';

export type SystemLogType = 
  | 'ai' 
  | 'system' 
  | 'email' 
  | 'auth' 
  | 'database' 
  | 'payment';

export interface SystemLog {
  id: number;
  level: SystemLogLevel;
  type: SystemLogType;
  message: string;
  errorCode?: string;
  userId?: number;
  userEmail?: string;
  toolType?: string;
  metadata?: {
    [key: string]: any;
  };
  createdAt: Date;
}

export interface GetSystemLogsParams {
  search?: string;
  level?: SystemLogLevel | 'all';
  type?: SystemLogType | 'all';
  page?: number;
  limit?: number;
}

export interface GetSystemLogsResponse {
  logs: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SystemStats {
  totalLogs: number;
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  byType: {
    ai: number;
    system: number;
    email: number;
    auth: number;
    database: number;
    payment: number;
  };
}
