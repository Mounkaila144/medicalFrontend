import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/lib/api-config';
import { Patient, PatientForm, PaginatedResponse, MedicalHistory, MedicalHistoryType } from '@/types';

export interface PatientSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  clinicId?: string;
}

export interface DocumentUploadData {
  patientId: string;
  docType: string;
  uploadedBy: string;
  tags?: string;
}

export class PatientService {
  // Get all patients with pagination and search
  static async getPatients(params: PatientSearchParams = {}): Promise<PaginatedResponse<Patient>> {
    try {
      // Get current user to check role and tenant
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const tenantId = user.tenantId || user.clinicId;
      
      console.log('🔍 Patient Service Debug:', {
        user,
        tenantId,
        params
      });
      
      // Build query string
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.clinicId) queryParams.append('clinicId', params.clinicId);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `${API_CONFIG.PATIENTS.LIST}?${queryString}` : API_CONFIG.PATIENTS.LIST;
      
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erreur lors du chargement des patients' }));
        throw new Error(error.message || 'Erreur lors du chargement des patients');
      }

      const result = await response.json();
      
      console.log('🔍 Raw API Response:', result);
      
      // Normaliser la réponse selon le format reçu
      if (Array.isArray(result)) {
        // L'API retourne directement un tableau
        console.log('📋 API returned array format, normalizing...');
        return {
          data: result,
          total: result.length,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: Math.ceil(result.length / (params.limit || 10))
        };
      } else if (result.data && Array.isArray(result.data)) {
        // L'API retourne une réponse paginée
        console.log('📋 API returned paginated format');
        return {
          data: result.data,
          total: result.total || result.data.length,
          page: result.page || params.page || 1,
          limit: result.limit || params.limit || 10,
          totalPages: result.totalPages || Math.ceil((result.total || result.data.length) / (result.limit || params.limit || 10))
        };
      } else {
        // Format inattendu
        console.warn('⚠️ Unexpected API response format:', result);
        return {
          data: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: 0
        };
      }
    } catch (error) {
      console.error('🔍 Patient Service Error:', error);
      throw error;
    }
  }

  // Search patients
  static async searchPatients(searchTerm: string): Promise<Patient[]> {
    const response = await fetch(buildApiUrl(`${API_CONFIG.PATIENTS.LIST}?search=${encodeURIComponent(searchTerm)}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la recherche' }));
      throw new Error(error.message || 'Erreur lors de la recherche');
    }

    const result = await response.json();
    
    // Gérer les différents formats de réponse
    if (Array.isArray(result)) {
      return result;
    } else if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else {
      return [];
    }
  }

  // Get patient by ID
  static async getPatientById(id: string): Promise<Patient> {
    const response = await fetch(buildApiUrl(API_CONFIG.PATIENTS.GET_BY_ID(id)), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Patient non trouvé' }));
      throw new Error(error.message || 'Patient non trouvé');
    }

    return response.json();
  }

  // Create new patient
  static async createPatient(patientData: PatientForm): Promise<Patient> {
    const response = await fetch(buildApiUrl(API_CONFIG.PATIENTS.CREATE), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la création du patient' }));
      throw new Error(error.message || 'Erreur lors de la création du patient');
    }

    return response.json();
  }

  // Update patient
  static async updatePatient(id: string, patientData: Partial<PatientForm>): Promise<Patient> {
    const response = await fetch(buildApiUrl(API_CONFIG.PATIENTS.UPDATE(id)), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la mise à jour du patient' }));
      throw new Error(error.message || 'Erreur lors de la mise à jour du patient');
    }

    return response.json();
  }

  // Delete patient
  static async deletePatient(id: string): Promise<void> {
    const response = await fetch(buildApiUrl(API_CONFIG.PATIENTS.DELETE(id)), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la suppression du patient' }));
      throw new Error(error.message || 'Erreur lors de la suppression du patient');
    }
  }

  // Upload patient document
  static async uploadDocument(file: File, data: DocumentUploadData): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', data.patientId);
    formData.append('docType', data.docType);
    formData.append('uploadedBy', data.uploadedBy);
    if (data.tags) {
      formData.append('tags', data.tags);
    }

    const response = await fetch(buildApiUrl('/patients/documents/upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        // Ne pas définir Content-Type pour les FormData, le navigateur le fait automatiquement
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'upload' }));
      throw new Error(error.message || 'Erreur lors de l\'upload');
    }

    return response.json();
  }

  // Get patient documents
  static async getPatientDocuments(patientId: string): Promise<any[]> {
    const response = await fetch(buildApiUrl(`/patients/documents/patient/${patientId}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors du chargement des documents' }));
      throw new Error(error.message || 'Erreur lors du chargement des documents');
    }

    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || []);
  }

  // Get patient medical history
  static async getPatientMedicalHistory(patientId: string): Promise<MedicalHistory[]> {
    const response = await fetch(buildApiUrl(`/patients/medical-history/patient/${patientId}`), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors du chargement de l\'historique médical' }));
      throw new Error(error.message || 'Erreur lors du chargement de l\'historique médical');
    }

    const result = await response.json();
    return Array.isArray(result) ? result : (result.data || []);
  }

  // Add medical history entry
  static async addMedicalHistoryEntry(data: {
    patientId: string;
    type: MedicalHistoryType;
    label: string;
    note?: string;
  }): Promise<MedicalHistory> {
    const response = await fetch(buildApiUrl('/patients/medical-history'), {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de l\'ajout de l\'historique médical' }));
      throw new Error(error.message || 'Erreur lors de l\'ajout de l\'historique médical');
    }

    return response.json();
  }

  // Update medical history entry
  static async updateMedicalHistoryEntry(id: string, data: Partial<MedicalHistory>): Promise<MedicalHistory> {
    const response = await fetch(buildApiUrl(`/patients/medical-history/${id}`), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la mise à jour de l\'historique médical' }));
      throw new Error(error.message || 'Erreur lors de la mise à jour de l\'historique médical');
    }

    return response.json();
  }

  // Delete medical history entry
  static async deleteMedicalHistoryEntry(id: string): Promise<void> {
    const response = await fetch(buildApiUrl(`/patients/medical-history/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors de la suppression de l\'historique médical' }));
      throw new Error(error.message || 'Erreur lors de la suppression de l\'historique médical');
    }
  }

  // Get patient statistics
  static async getPatientStats(): Promise<{
    total: number;
    newThisMonth: number;
    byGender: Record<string, number>;
    byAgeGroup: Record<string, number>;
  }> {
    const response = await fetch(buildApiUrl('/patients/stats'), {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur lors du chargement des statistiques' }));
      throw new Error(error.message || 'Erreur lors du chargement des statistiques');
    }

    return response.json();
  }

  // Export patients data
  static async exportPatients(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(buildApiUrl(`${API_CONFIG.PATIENTS.EXPORT}?format=${format}`), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  }
} 