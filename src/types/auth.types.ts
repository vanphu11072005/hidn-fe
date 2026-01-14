// User types
export interface User {
  id: number;
  email: string;
  emailVerified: boolean;
  role: string;
  authProviders?: Array<{
    provider: 'local' | 'google' | 'facebook' | 'github' | 'apple';
    linkedAt: string;
  }>;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
  };
  credits: {
    totalCredits: number;
    freeCredits: number;
    paidCredits: number;
  };
  createdAt: string;
}

// Auth request types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Auth response types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  userId: number;
  email: string;
  accessToken: string;
  refreshToken: string;
  emailVerified: boolean;
  message?: string;
}

export interface ProfileResponse {
  id: number;
  email: string;
  emailVerified: boolean;
  role: string;
  authProviders?: Array<{
    provider: 'local' | 'google' | 'facebook' | 'github' | 'apple';
    linkedAt: string;
  }>;
  credits: {
    totalCredits: number;
    freeCredits: number;
    paidCredits: number;
  };
  createdAt: string;
  displayName?: string | null;
  avatarUrl?: string | null;
}
