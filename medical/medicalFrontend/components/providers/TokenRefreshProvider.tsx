'use client';

import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { ReactNode } from 'react';

interface TokenRefreshProviderProps {
  children: ReactNode;
}

/**
 * Provider pour initialiser le système de refresh automatique des tokens
 * sur toute l'application
 */
export const TokenRefreshProvider = ({ children }: TokenRefreshProviderProps) => {
  useTokenRefresh();
  return <>{children}</>;
};