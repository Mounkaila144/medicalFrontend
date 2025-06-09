import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/api-config';

export interface Clinic {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  // Autres propriétés possibles selon votre modèle
  address?: string;
  phone?: string;
  email?: string;
}

export interface CreateClinicData {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export class ClinicService {
  /**
   * Récupérer la liste des cliniques
   */
  static async getClinics(): Promise<Clinic[]> {
    const response = await fetch(buildApiUrl(API_CONFIG.CLINICS.LIST), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération des cliniques' }));
      throw new Error(error.message || 'Erreur lors de la récupération des cliniques');
    }

    const result = await response.json();
    
    // Gérer différents formats de réponse
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else {
      return [];
    }
  }

  /**
   * Récupérer les tenants (pour les SUPERADMIN)
   */
  static async getTenants(): Promise<Clinic[]> {
    const response = await fetch(buildApiUrl(API_CONFIG.ADMIN.TENANTS), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la récupération des tenants' }));
      throw new Error(error.message || 'Erreur lors de la récupération des tenants');
    }

    const result = await response.json();
    
    // Gérer différents formats de réponse
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else {
      return [];
    }
  }

  /**
   * Créer une nouvelle clinique
   */
  static async createClinic(data: CreateClinicData): Promise<Clinic> {
    const response = await fetch(buildApiUrl(API_CONFIG.CLINICS.CREATE), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la création de la clinique' }));
      throw new Error(error.message || 'Erreur lors de la création de la clinique');
    }

    return response.json();
  }

  /**
   * Récupérer une clinique par ID
   */
  static async getClinicById(id: string): Promise<Clinic> {
    const response = await fetch(buildApiUrl(API_CONFIG.CLINICS.GET_BY_ID(id)), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Clinique non trouvée' }));
      throw new Error(error.message || 'Clinique non trouvée');
    }

    return response.json();
  }

  /**
   * Mettre à jour une clinique
   */
  static async updateClinic(id: string, data: Partial<CreateClinicData>): Promise<Clinic> {
    const response = await fetch(buildApiUrl(API_CONFIG.CLINICS.UPDATE(id)), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la mise à jour de la clinique' }));
      throw new Error(error.message || 'Erreur lors de la mise à jour de la clinique');
    }

    return response.json();
  }

  /**
   * Supprimer une clinique
   */
  static async deleteClinic(id: string): Promise<void> {
    const response = await fetch(buildApiUrl(API_CONFIG.CLINICS.DELETE(id)), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la suppression de la clinique' }));
      throw new Error(error.message || 'Erreur lors de la suppression de la clinique');
    }
  }
} 