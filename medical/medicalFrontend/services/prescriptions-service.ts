import { apiClient } from "@/lib/api";

export interface Prescription {
  id: string;
  encounter: {
    id: string;
    motive: string;
    startAt: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      mrn: string;
    };
  };
  encounterId: string;
  practitioner: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  practitionerId: string;
  items: PrescriptionItem[];
  pdfPath?: string;
  qr?: string;
  expiresAt?: string;
}

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface CreatePrescriptionDto {
  encounterId: string;
  practitionerId: string;
  expiresAt?: Date;
  items: PrescriptionItem[];
}

class PrescriptionsService {
  async getPrescriptions(): Promise<Prescription[]> {
    try {
      const response = await apiClient.get<Prescription[]>('/prescriptions');
      return response;
    } catch (error) {
      console.error("Get prescriptions error:", error);
      throw error;
    }
  }

  async getPrescription(id: string): Promise<Prescription> {
    try {
      const response = await apiClient.get<Prescription>(`/prescriptions/${id}`);
      return response;
    } catch (error) {
      console.error("Get prescription error:", error);
      throw error;
    }
  }

  async createPrescription(data: CreatePrescriptionDto): Promise<Prescription> {
    try {
      const response = await apiClient.post<Prescription>('/prescriptions', data);
      return response;
    } catch (error) {
      console.error("Create prescription error:", error);
      throw error;
    }
  }

  async updatePrescription(id: string, data: Partial<CreatePrescriptionDto>): Promise<Prescription> {
    try {
      const response = await apiClient.put<Prescription>(`/prescriptions/${id}`, data);
      return response;
    } catch (error: any) {
      console.error("Update prescription error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de mise à jour des prescriptions non encore implémenté dans le backend');
      }
      throw error;
    }
  }

  async deletePrescription(id: string): Promise<void> {
    try {
      await apiClient.delete(`/prescriptions/${id}`);
    } catch (error: any) {
      console.error("Delete prescription error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de suppression des prescriptions non encore implémenté dans le backend');
      }
      throw error;
    }
  }
}

export const prescriptionsService = new PrescriptionsService();