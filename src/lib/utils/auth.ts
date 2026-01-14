import type { ProfileResponse, User } from '@/types/auth.types';

/**
 * Maps API ProfileResponse to User type
 * Used to normalize profile data from backend API
 */
export function mapProfileToUser(profile: ProfileResponse): User {
  return {
    id: profile.id,
    email: profile.email,
    emailVerified: profile.emailVerified,
    role: profile.role,
    credits: profile.credits,
    createdAt: profile.createdAt,
    profile: {
      displayName: profile.displayName ?? null,
      avatarUrl: profile.avatarUrl ?? null,
    },
  };
}
