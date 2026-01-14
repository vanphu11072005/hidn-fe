import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email và mật khẩu là bắt buộc');
        }

        try {
          // Call backend login API
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || 'Invalid email or password'
            );
          }

          // Store tokens for later use
          const user = {
            id: data.data.userId.toString(),
            email: data.data.email,
            role: data.data.role,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          };

          return user;
        } catch (error: any) {
          throw new Error(error.message || 'Đăng nhập thất bại');
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || token.id || '';
        // Add role to session
        (session.user as any).role = token.role || 'user';
        // Add custom fields from token
        if (token.accessToken) {
          (session as any).accessToken = token.accessToken;
        }
        if (token.refreshToken) {
          (session as any).refreshToken = token.refreshToken;
        }
        // Add expiry info for debugging
        if (token.accessTokenExpires) {
          (session as any).accessTokenExpires = token.accessTokenExpires;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        // Store role from user object
        token.role = (user as any).role || 'user';
        // Store backend tokens if credentials login
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
          token.refreshToken = (user as any).refreshToken;
          // Set token expiry (default 1 hour from now)
          token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
        }
      }

      // Handle Google OAuth sign in
      if (account?.provider === 'google' && user) {
        try {
          // Call backend Google auth endpoint
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                googleId: account.providerAccountId,
                email: user.email,
                name: user.name,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.success) {
            // Store backend tokens and role
            token.id = data.data.userId.toString();
            token.role = data.data.role || 'user';
            token.accessToken = data.data.accessToken;
            token.refreshToken = data.data.refreshToken;
            token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
          } else {
            console.error('Backend Google auth failed:', data);
          }
        } catch (error) {
          console.error('Error calling backend Google auth:', error);
        }
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                refreshToken: token.refreshToken,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.success) {
            // Successfully refreshed tokens
            token.accessToken = data.data.accessToken;
            token.refreshToken = data.data.refreshToken || token.refreshToken;
            token.accessTokenExpires = Date.now() + 60 * 60 * 1000;
            return token;
          } else {
            console.error('Token refresh failed:', data.message);
            // Return token with error - will trigger re-login
            return { ...token, error: 'RefreshAccessTokenError' };
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }

      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
