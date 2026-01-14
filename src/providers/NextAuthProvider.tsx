'use client';

import { SessionProvider as NextAuthSessionProvider } from 
  'next-auth/react';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function NextAuthProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
