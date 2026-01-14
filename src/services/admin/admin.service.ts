import { apiClient } from '../api/client';
import type {
  AdminUser,
  GetUsersParams,
  GetUsersResponse,
  CreditTransaction,
  ToolUsage,
  AdminUserDetail,
  CreditLog,
  GetCreditLogsParams,
  GetCreditLogsResponse,
  ToolPricing,
  BonusConfig,
  CreditConfig,
  ToolAnalytics,
  AdminToolConfig,
  SecurityEventType,
  RiskLevel,
  SecurityLog,
  GetSecurityLogsParams,
  GetSecurityLogsResponse,
  SecurityStats,
  SystemLogLevel,
  SystemLogType,
  SystemLog,
  GetSystemLogsParams,
  GetSystemLogsResponse,
  SystemStats,
} from '@/types/admin.types';

export const adminService = {
  /**
   * Get users list with filters and pagination
   */
  async getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

    return await apiClient.get<GetUsersResponse>(endpoint);
  },

  /**
   * Get user detail by ID
   */
  async getUserById(userId: number): Promise<AdminUserDetail> {
    return await apiClient.get<AdminUserDetail>(`/api/admin/users/${userId}`);
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    return await apiClient.get('/api/admin/dashboard/stats');
  },

  /**
   * Get credit logs with filters and pagination
   */
  async getCreditLogs(
    params: GetCreditLogsParams = {}
  ): Promise<GetCreditLogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.toolType) {
      queryParams.append('toolType', params.toolType);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = 
      `/api/admin/credits/logs${queryString ? `?${queryString}` : ''}`;

    return await apiClient.get<GetCreditLogsResponse>(endpoint);
  },

  /**
   * Get credit configuration
   */
  async getCreditConfig(): Promise<CreditConfig> {
    return await apiClient.get<CreditConfig>('/api/admin/credits/config');
  },

  /**
   * Update credit configuration
   */
  async updateCreditConfig(config: CreditConfig): Promise<void> {
    await apiClient.put('/api/admin/credits/config', config);
  },

  /**
   * Get tool analytics
   */
  async getToolAnalytics(): Promise<ToolAnalytics[]> {
    return await apiClient.get<ToolAnalytics[]>('/api/admin/tools/analytics');
  },

  /**
   * Get tool configurations
   */
  async getToolConfigs(): Promise<AdminToolConfig[]> {
    return await apiClient.get<AdminToolConfig[]>(
      '/api/admin/tools/config'
    );
  },

  /**
   * Update tool configurations
   */
  async updateToolConfigs(configs: AdminToolConfig[]): Promise<void> {
    await apiClient.put('/api/admin/tools/config', { configs });
  },

  /**
   * Get security logs with filters and pagination
   */
  async getSecurityLogs(
    params: GetSecurityLogsParams = {}
  ): Promise<GetSecurityLogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.eventType && params.eventType !== 'all') {
      queryParams.append('eventType', params.eventType);
    }
    if (params.riskLevel && params.riskLevel !== 'all') {
      queryParams.append('riskLevel', params.riskLevel);
    }
    if (params.resolved !== undefined) {
      queryParams.append('resolved', params.resolved.toString());
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = 
      `/api/admin/security-logs${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<GetSecurityLogsResponse>(endpoint);
    
    // Convert date strings to Date objects
    response.logs = response.logs.map(log => ({
      ...log,
      timestamp: new Date(log.timestamp),
      createdAt: new Date(log.createdAt),
      resolvedAt: log.resolvedAt ? new Date(log.resolvedAt) : undefined
    }));

    return response;
  },

  /**
   * Get security statistics
   */
  async getSecurityStats(): Promise<SecurityStats> {
    return await apiClient.get<SecurityStats>('/api/admin/security-logs/stats');
  },

  /**
   * Resolve a security log
   */
  async resolveSecurityLog(logId: number, notes?: string): Promise<void> {
    await apiClient.patch(`/api/admin/security-logs/${logId}/resolve`, { notes });
  },

  /**
   * Get security log by ID
   */
  async getSecurityLogById(logId: number): Promise<SecurityLog> {
    const log = await apiClient.get<SecurityLog>(
      `/api/admin/security-logs/${logId}`
    );
    
    // Convert date strings to Date objects
    return {
      ...log,
      timestamp: new Date(log.timestamp),
      createdAt: new Date(log.createdAt),
      resolvedAt: log.resolvedAt ? new Date(log.resolvedAt) : undefined
    };
  },

  /**
   * Get system logs with filters and pagination
   */
  async getSystemLogs(
    params: GetSystemLogsParams = {}
  ): Promise<GetSystemLogsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.level && params.level !== 'all') {
      queryParams.append('level', params.level);
    }
    if (params.type && params.type !== 'all') {
      queryParams.append('type', params.type);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const endpoint = 
      `/api/admin/system-logs${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<GetSystemLogsResponse>(endpoint);
    
    // Convert date strings to Date objects
    response.logs = response.logs.map(log => ({
      ...log,
      createdAt: new Date(log.createdAt)
    }));

    return response;
  },

  /**
   * Get system log statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    return await apiClient.get<SystemStats>(
      '/api/admin/system-logs/stats'
    );
  },

  /**
   * Create a system log entry
   */
  async createSystemLog(logData: {
    level: SystemLogLevel;
    type: SystemLogType;
    message: string;
    errorCode?: string;
    userId?: number;
    userEmail?: string;
    toolType?: string;
    metadata?: any;
  }): Promise<SystemLog> {
    const log = await apiClient.post<SystemLog>(
      '/api/admin/system-logs', 
      logData
    );
    
    return {
      ...log,
      createdAt: new Date(log.createdAt)
    };
  },
};
