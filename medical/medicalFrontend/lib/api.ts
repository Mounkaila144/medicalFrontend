import { AuthResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Token management
class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<boolean> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenSetAt', Date.now().toString());
    
    // Schedule proactive refresh (refresh 5 minutes before expiration)
    this.scheduleTokenRefresh(accessToken);
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('practitioner');
    localStorage.removeItem('tokenSetAt');
    
    // Clear refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Decode JWT payload to get expiration
  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  // Check if token is expired or will expire soon
  isTokenExpired(token: string, bufferMinutes: number = 5): boolean {
    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const bufferTime = bufferMinutes * 60 * 1000; // Convert minutes to milliseconds
    const now = Date.now();
    
    return now >= (expirationTime - bufferTime);
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(accessToken: string): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const decoded = this.decodeJWT(accessToken);
    if (!decoded || !decoded.exp) return;

    const expirationTime = decoded.exp * 1000;
    const refreshTime = expirationTime - (5 * 60 * 1000) - Date.now(); // Refresh 5 minutes before expiration

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.proactiveRefresh();
      }, refreshTime);
      
      console.log(`🔄 Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
    }
  }

  // Proactive token refresh
  private async proactiveRefresh(): Promise<void> {
    const apiClient = new ApiClient(API_BASE_URL);
    try {
      await apiClient.refreshTokens();
      console.log('✅ Token refreshed proactively');
    } catch (error) {
      console.error('❌ Proactive token refresh failed:', error);
      // Don't redirect immediately, let the reactive refresh handle it
    }
  }

  setUser(user: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setPractitioner(practitioner: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('practitioner', JSON.stringify(practitioner));
  }

  getPractitioner(): any | null {
    if (typeof window === 'undefined') return null;
    const practitioner = localStorage.getItem('practitioner');
    return practitioner ? JSON.parse(practitioner) : null;
  }

  // Get a promise for token refresh to avoid concurrent refreshes
  getRefreshPromise(): Promise<boolean> | null {
    return this.refreshPromise;
  }

  setRefreshPromise(promise: Promise<boolean> | null): void {
    this.refreshPromise = promise;
  }

  // Public method to decode JWT for external use
  decodeToken(token: string): any {
    return this.decodeJWT(token);
  }
}

export const tokenManager = TokenManager.getInstance();

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let accessToken = tokenManager.getAccessToken();

    // Check if token is expired and proactively refresh if needed
    if (accessToken && tokenManager.isTokenExpired(accessToken, 2)) {
      // If there's already a refresh in progress, wait for it
      const existingRefreshPromise = tokenManager.getRefreshPromise();
      if (existingRefreshPromise) {
        await existingRefreshPromise;
        accessToken = tokenManager.getAccessToken();
      } else {
        // Start a new refresh
        const refreshPromise = this.refreshTokens();
        tokenManager.setRefreshPromise(refreshPromise);
        try {
          const refreshed = await refreshPromise;
          if (refreshed) {
            accessToken = tokenManager.getAccessToken();
          } else {
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            throw new ApiError(401, 'Token refresh failed');
          }
        } finally {
          tokenManager.setRefreshPromise(null);
        }
      }
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    // Debug log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        url,
        method: options.method || 'GET',
        hasToken: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'None',
        headers: config.headers
      });
    }

    try {
      const response = await fetch(url, config);

      // Handle 401 - Token expired (reactive refresh as fallback)
      if (response.status === 401 && accessToken) {
        console.log('🔄 Reactive token refresh triggered');
        const refreshed = await this.refreshTokens();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = tokenManager.getAccessToken();
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          const retryResponse = await fetch(url, retryConfig);
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            throw new ApiError(retryResponse.status, errorData.message || 'Request failed', errorData);
          }
          return retryResponse.json();
        } else {
          // Refresh failed, redirect to login
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          throw new ApiError(401, 'Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Debug log for development
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ API Error:', {
            status: response.status,
            statusText: response.statusText,
            url,
            errorData,
            responseHeaders: Object.fromEntries(response.headers.entries())
          });
        }
        
        throw new ApiError(response.status, errorData.message || 'Request failed', errorData);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error occurred');
    }
  }

  // Public method for token refresh
  async refreshTokens(): Promise<boolean> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      console.log('🔄 Refreshing tokens...');
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data: AuthResponse = await response.json();
        tokenManager.setTokens(data.accessToken, data.refreshToken);
        console.log('✅ Tokens refreshed successfully');
        return true;
      } else {
        console.error('❌ Token refresh failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return false;
    }
  }

  // Legacy method for backward compatibility
  private async refreshToken(): Promise<boolean> {
    return this.refreshTokens();
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload method
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const accessToken = tokenManager.getAccessToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.message || 'Upload failed', errorData);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Utility functions for common API patterns
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}; 