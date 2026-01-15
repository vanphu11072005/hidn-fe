import type { ApiResponse, ApiError } from '@/types/common.types';
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  'https://hidn-be.onrender.com';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_URL;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    // Try to get token from NextAuth session first
    try {
      const session = await getSession();
      if (session && (session as any).accessToken) {
        return { 
          Authorization: `Bearer ${(session as any).accessToken}` 
        };
      }
    } catch (error) {
      console.error('Failed to get session:', error);
    }

    // Fallback to localStorage for backward compatibility
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    
    return {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`[API] Starting request to: ${url}`);
    
    const authHeader: Record<string, string> = await this.getAuthHeader();
    const isForm = options.body instanceof FormData;
    const headers: HeadersInit = {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...authHeader,
      ...options.headers,
    };

    console.log('[API] Request headers:', { 
      hasAuth: !!authHeader.Authorization,
      method: options.method || 'GET'
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log(`[API] Response status: ${response.status} ${
        response.statusText
      }`);

      // Try to parse as JSON, but handle non-JSON responses
      let data: ApiResponse<T>;
      try {
        const textResponse = await response.text();
        console.log('[API] Response text:', textResponse.substring(0, 200));
        
        if (!textResponse) {
          throw new Error('Empty response from server');
        }
        
        data = JSON.parse(textResponse);
      } catch (jsonError: any) {
        console.error('[API] JSON parse error:', jsonError.message);
        // If response is not JSON, throw a network error
        const error: ApiError = {
          success: false,
          message: `Invalid server response: ${
            response.statusText || 'Not JSON'
          }`,
          statusCode: response.status,
        };
        throw error;
      }

      if (!response.ok) {
        const error: ApiError = {
          success: false,
          message: data.message || 'An error occurred',
          error: data.error,
          statusCode: response.status,
        };
        
        // Use warn for auth/permission errors (401/403) to avoid noisy errors.
        if (response.status === 401 || response.status === 403) {
          console.warn('[API] Permission denied:', data.message);
          // Clear any locally stored token and trigger NextAuth signOut
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
            }
            // Attempt to clear NextAuth session client-side
            signOut({ redirect: false }).catch(() => {});
          } catch (e) {
            // swallow errors from cleanup
          }
        } else {
          console.error('[API] HTTP Error:', JSON.stringify(error, null, 2));
        }
        
        throw error;
      }

      if (!data.success) {
        const error = {
          success: false,
          message: data.message || 'Request failed',
          statusCode: response.status,
        } as ApiError;
        console.error('[API] API Failed:', error);
        throw error;
      }

      console.log('[API] Success - returning data');
      return data.data as T;
    } catch (error: any) {
      // If error is already our ApiError format, re-throw it
      if (error.success === false && error.message) {
        // Don't log 401/403 errors again, they were already logged above
        if (error.statusCode !== 401 && error.statusCode !== 403) {
          console.error('[API] Caught API error:', {
            message: error.message,
            statusCode: error.statusCode,
          });
        }
        throw error;
      }
      
      // Network or other errors - create structured error
      const structuredError: ApiError = {
        success: false,
        message: error.message || 
          'Network error - please check your connection',
        statusCode: error.statusCode || 0,
        error: error.name || 'NetworkError',
      };
      
      console.error('[API] Throwing structured error:', structuredError);
      
      throw structuredError;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    const isForm = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      headers: isForm ? {} : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    const isForm = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      headers: isForm ? {} : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    const isForm = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
      headers: isForm ? {} : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
