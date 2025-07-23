import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { User, Practitioner, LoginForm } from '@/types';
import { handleApiError, tokenManager } from '@/lib/api';
import { useTokenRefresh } from './useTokenRefresh';

interface AuthState {
  user: User | null;
  practitioner: Practitioner | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<AuthState>({
    user: null,
    practitioner: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize token refresh system
  useTokenRefresh();

  // Initialize auth state
  useEffect(() => {
    setMounted(true);
    
    const initializeAuth = () => {
      try {
        const token = tokenManager.getAccessToken();
        const userData = tokenManager.getUser();
        
        if (token && userData) {
          setState({
            user: userData as User,
            practitioner: null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            practitioner: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: handleApiError(error),
        }));
      }
    };

    initializeAuth();
  }, []);

  // Unified login
  const login = useCallback(async (credentials: LoginForm) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.login(credentials);
      
      if (response.userType === 'user') {
        setState({
          user: response.user || null,
          practitioner: null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        router.push('/dashboard');
      } else {
        setState({
          user: null,
          practitioner: response.practitioner || null,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        router.push('/practitioner/dashboard');
      }

      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  // Login user
  const loginUser = useCallback(async (credentials: LoginForm) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.loginUser(credentials);
      
      setState({
        user: response.user || null,
        practitioner: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push('/dashboard');
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  // Login practitioner
  const loginPractitioner = useCallback(async (credentials: LoginForm) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await AuthService.loginPractitioner(credentials);
      
      setState({
        user: null,
        practitioner: response.practitioner || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      router.push('/practitioner/dashboard');
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (state.practitioner) {
        await AuthService.logoutPractitioner();
      } else {
        await AuthService.logout();
      }
      
      setState({
        user: null,
        practitioner: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      router.push('/auth/login');
    } catch (error) {
      // Even if logout fails, clear local state
      setState({
        user: null,
        practitioner: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      router.push('/auth/login');
    }
  }, [state.practitioner, router]);

  // Check if user has specific role
  const hasRole = useCallback((role: string): boolean => {
    return AuthService.hasRole(role);
  }, []);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return AuthService.hasAnyRole(roles);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Get current user type
  const getUserType = useCallback((): 'user' | 'practitioner' | null => {
    if (state.user) return 'user';
    if (state.practitioner) return 'practitioner';
    return null;
  }, [state.user, state.practitioner]);

  // Get current user display name
  const getDisplayName = useCallback((): string => {
    if (state.user) {
      return `${state.user.firstName} ${state.user.lastName}`;
    }
    if (state.practitioner) {
      return `Dr. ${state.practitioner.firstName} ${state.practitioner.lastName}`;
    }
    return '';
  }, [state.user, state.practitioner]);

  const checkAuth = (): boolean => {
    const token = tokenManager.getAccessToken();
    return !!token;
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return {
      // State
      user: null,
      practitioner: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      
      // Actions
      login,
      loginUser,
      loginPractitioner,
      logout,
      clearError,
      
      // Utilities
      hasRole,
      hasAnyRole,
      getUserType,
      getDisplayName,
      checkAuth,
    };
  }

  return {
    // State
    user: state.user,
    practitioner: state.practitioner,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    login,
    loginUser,
    loginPractitioner,
    logout,
    clearError,
    
    // Utilities
    hasRole,
    hasAnyRole,
    getUserType,
    getDisplayName,
    checkAuth,
  };
}; 