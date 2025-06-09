import { apiClient, tokenManager } from '@/lib/api';
import { AuthResponse, LoginForm, User, Practitioner } from '@/types';

export class AuthService {
  // Unified login - tries user first, then practitioner
  static async login(credentials: LoginForm): Promise<AuthResponse & { userType: 'user' | 'practitioner' }> {
    try {
      // Try user login first
      const userResponse = await this.loginUser(credentials);
      return { ...userResponse, userType: 'user' };
    } catch (userError) {
      try {
        // If user login fails, try practitioner login
        const practitionerResponse = await this.loginPractitioner(credentials);
        return { ...practitionerResponse, userType: 'practitioner' };
      } catch (practitionerError) {
        // If both fail, throw the original user error
        throw userError;
      }
    }
  }

  // User authentication
  static async loginUser(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    if (response.accessToken && response.refreshToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      if (response.user) {
        tokenManager.setUser(response.user);
      }
    }
    
    return response;
  }

  // Practitioner authentication
  static async loginPractitioner(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/practitioner/login', credentials);
    
    if (response.accessToken && response.refreshToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      if (response.practitioner) {
        tokenManager.setPractitioner(response.practitioner);
      }
    }
    
    return response;
  }

  // Refresh token
  static async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    
    if (response.accessToken && response.refreshToken) {
      tokenManager.setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  }

  // Logout
  static async logout(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch (error) {
        // Continue with logout even if API call fails
        console.error('Logout API call failed:', error);
      }
    }
    
    tokenManager.clearTokens();
  }

  // Practitioner logout
  static async logoutPractitioner(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    
    if (refreshToken) {
      try {
        await apiClient.post('/auth/practitioner/logout', { refreshToken });
      } catch (error) {
        console.error('Practitioner logout API call failed:', error);
      }
    }
    
    tokenManager.clearTokens();
  }

  // Get current user
  static getCurrentUser(): User | null {
    return tokenManager.getUser();
  }

  // Get current practitioner
  static getCurrentPractitioner(): Practitioner | null {
    return tokenManager.getPractitioner();
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }

  // Get practitioner profile
  static async getPractitionerProfile(): Promise<Practitioner> {
    return apiClient.get<Practitioner>('/auth/practitioner/profile');
  }

  // Check user role
  static hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    const practitioner = this.getCurrentPractitioner();
    
    if (user) {
      return user.role === requiredRole;
    }
    
    if (practitioner) {
      return requiredRole === 'PRACTITIONER';
    }
    
    return false;
  }

  // Check if user has any of the required roles
  static hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
} 