import { apiClient } from "@/lib/api";

export interface LabResult {
  id: string;
  tenantId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  patientId: string;
  encounter?: {
    id: string;
    motive: string;
    startAt: string;
  };
  encounterId?: string;
  labName: string;
  result: Record<string, any>;
  filePath?: string;
  receivedAt: string;
}

export interface CreateLabResultDto {
  patientId: string;
  encounterId?: string;
  labName: string;
  result: Record<string, any>;
  filePath?: string;
  receivedAt: string;
}

class LabResultsService {
  async getLabResults(): Promise<LabResult[]> {
    try {
      const response = await apiClient.get<LabResult[]>('/labs');
      return response;
    } catch (error) {
      console.error("Get lab results error:", error);
      throw error;
    }
  }

  async getLabResult(id: string): Promise<LabResult> {
    try {
      const response = await apiClient.get<LabResult>(`/labs/${id}`);
      return response;
    } catch (error) {
      console.error("Get lab result error:", error);
      throw error;
    }
  }

  async getLabResultsByPatient(patientId: string): Promise<LabResult[]> {
    try {
      const response = await apiClient.get<LabResult[]>(`/labs/patient/${patientId}`);
      return response;
    } catch (error) {
      console.error("Get lab results by patient error:", error);
      throw error;
    }
  }

  async createLabResult(data: CreateLabResultDto): Promise<LabResult> {
    try {
      const response = await apiClient.post<LabResult>('/labs', data);
      return response;
    } catch (error) {
      console.error("Create lab result error:", error);
      throw error;
    }
  }

  async updateLabResult(id: string, data: Partial<CreateLabResultDto>): Promise<LabResult> {
    try {
      const response = await apiClient.put<LabResult>(`/labs/${id}`, data);
      return response;
    } catch (error: any) {
      console.error("Update lab result error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de mise à jour des résultats labo non encore implémenté dans le backend');
      }
      throw error;
    }
  }

  async deleteLabResult(id: string): Promise<void> {
    try {
      await apiClient.delete(`/labs/${id}`);
    } catch (error: any) {
      console.error("Delete lab result error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de suppression des résultats labo non encore implémenté dans le backend');
      }
      throw error;
    }
  }

  async uploadLabResultFile(id: string, file: File): Promise<LabResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.upload<LabResult>(`/labs/${id}/upload`, formData);
      return response;
    } catch (error) {
      console.error("Upload lab result file error:", error);
      throw error;
    }
  }
}

export const labResultsService = new LabResultsService();