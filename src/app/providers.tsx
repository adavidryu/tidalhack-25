'use client';

import { AuthProvider } from '@/context/AuthContext';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AuthProvider>{children}</AuthProvider>
    </UserProvider>
  );
} 