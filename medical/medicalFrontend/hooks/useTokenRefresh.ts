import { useEffect } from 'react';
import { tokenManager } from '@/lib/api';

/**
 * Hook pour initialiser et gérer le refresh automatique des tokens
 */
export const useTokenRefresh = () => {
  useEffect(() => {
    // Initialize token refresh system
    const initializeTokenSystem = () => {
      const accessToken = tokenManager.getAccessToken();
      
      if (accessToken) {
        // Check if token is already expired
        if (tokenManager.isTokenExpired(accessToken, 0)) {
          console.log('🔄 Token already expired, clearing tokens');
          tokenManager.clearTokens();
          return;
        }
        
        // Schedule refresh if token is valid
        const decoded = tokenManager.decodeToken(accessToken);
        if (decoded && decoded.exp) {
          const expirationTime = decoded.exp * 1000;
          const timeUntilExpiration = expirationTime - Date.now();
          const minutesUntilExpiration = Math.round(timeUntilExpiration / 1000 / 60);
          
          console.log(`🔑 Token valid for ${minutesUntilExpiration} more minutes`);
          
          // Re-schedule the refresh (this will be done automatically by setTokens)
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken) {
            tokenManager.setTokens(accessToken, refreshToken);
          }
        }
      }
    };

    // Initialize on mount
    initializeTokenSystem();

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'accessToken') {
        if (event.newValue) {
          // New token set, initialize refresh system
          console.log('🔄 New token detected from another tab');
          initializeTokenSystem();
        } else {
          // Token cleared, clear refresh timer
          console.log('🔄 Token cleared from another tab');
          tokenManager.clearTokens();
        }
      }
    };

    // Listen for visibility change to refresh token when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const accessToken = tokenManager.getAccessToken();
        if (accessToken && tokenManager.isTokenExpired(accessToken, 5)) {
          console.log('🔄 Tab became active, checking token freshness');
          // Token will be refreshed automatically on next API call
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};