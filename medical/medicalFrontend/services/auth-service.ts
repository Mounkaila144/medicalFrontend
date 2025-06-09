import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/api-config';
import { RegisterData } from "@/types/auth";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
}

export interface LoginData {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export class AuthService {
  /**
   * Connexion utilisateur
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(buildApiUrl(API_CONFIG.AUTH.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
      throw new Error(error.message || 'Erreur de connexion');
    }

    const result = await response.json();
    
    // Stocker les tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }

  /**
   * Inscription utilisateur
   */
  static async register(data: RegisterData): Promise<User> {
    const response = await fetch(buildApiUrl(API_CONFIG.AUTH.REGISTER), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur d\'inscription' }));
      throw new Error(error.message || 'Erreur d\'inscription');
    }

    return response.json();
  }

  /**
   * Récupérer le profil utilisateur
   */
  static async getProfile(): Promise<User> {
    const response = await fetch(buildApiUrl(API_CONFIG.AUTH.PROFILE), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération du profil' }));
      throw new Error(error.message || 'Erreur lors de la récupération du profil');
    }

    const user = await response.json();
    
    // Mettre à jour le localStorage avec les nouvelles données
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  }

  /**
   * Rafraîchir le token
   */
  static async refreshToken(): Promise<AuthResponse> {
    if (typeof window === 'undefined') {
      throw new Error('Refresh token not available on server side');
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(buildApiUrl(API_CONFIG.AUTH.REFRESH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Si le refresh token est invalide, supprimer les données
      this.logout();
      throw new Error('Session expirée');
    }

    const result = await response.json();
    
    // Mettre à jour les tokens
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    localStorage.setItem('user', JSON.stringify(result.user));
    
    return result;
  }

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          await fetch(buildApiUrl(API_CONFIG.AUTH.LOGOUT), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ refreshToken }),
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Nettoyer le localStorage dans tous les cas
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    
    return !!(token && user);
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  static getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Obtenir le token d'accès
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem('accessToken');
  }
}