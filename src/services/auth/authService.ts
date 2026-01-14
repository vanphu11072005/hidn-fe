import { apiClient } from '../api/client';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  ProfileResponse,
  AuthTokens,
} from '@/types/auth.types';

class AuthService {
  // Token management
  setTokens(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth API calls
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      data
    );
    this.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    return response;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      data
    );
    this.setTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    return apiClient.get<ProfileResponse>('/api/auth/profile');
  }

  async updateProfile(formData: FormData): Promise<ProfileResponse> {
    return apiClient.put<ProfileResponse>('/api/auth/profile', formData);
  }

  async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokens = await apiClient.post<AuthTokens>(
      '/api/auth/refresh',
      { refreshToken }
    );
    this.setTokens(tokens);
    return tokens;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Email verification
  async verifyEmail(code: string): Promise<void> {
    await apiClient.post('/api/auth/verify-email', { code });
  }

  async resendVerification(): Promise<void> {
    await apiClient.post('/api/auth/resend-verification');
  }

  // Password reset
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  }

  async resetPassword(
    token: string, 
    password: string
  ): Promise<void> {
    await apiClient.post('/api/auth/reset-password', { 
      token, 
      password 
    });
  }
}

export const authService = new AuthService();
