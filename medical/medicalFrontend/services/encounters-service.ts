import { apiClient } from "@/lib/api";

export interface Encounter {
  id: string;
  tenantId: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  patientId: string;
  practitioner: {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
  };
  practitionerId: string;
  startAt: string;
  endAt?: string;
  motive: string;
  exam?: string;
  diagnosis?: string;
  icd10Codes?: string[];
  locked: boolean;
  prescriptions?: Prescription[];
  labResults?: LabResult[];
}

export interface Prescription {
  id: string;
  encounterId: string;
  practitionerId: string;
  pdfPath?: string;
  qr?: string;
  expiresAt?: string;
}

export interface LabResult {
  id: string;
  tenantId: string;
  patientId: string;
  encounterId?: string;
  labName: string;
  result: Record<string, any>;
  filePath?: string;
  receivedAt: string;
}

export interface CreateEncounterDto {
  patientId: string;
  practitionerId: string;
  startAt: string;
  endAt?: string;
  motive: string;
  exam?: string;
  diagnosis?: string;
  icd10Codes?: string[];
}

export interface UpdateEncounterDto {
  id: string;
  patientId?: string;
  practitionerId?: string;
  startAt?: string;
  endAt?: string;
  motive?: string;
  exam?: string;
  diagnosis?: string;
  icd10Codes?: string[];
}

export interface LockEncounterDto {
  id: string;
}

class EncountersService {
  async getEncounters(): Promise<Encounter[]> {
    try {
      const response = await apiClient.get<Encounter[]>('/encounters');
      return response;
    } catch (error) {
      console.error("Get encounters error:", error);
      throw error;
    }
  }

  async getEncounter(id: string): Promise<Encounter> {
    try {
      const response = await apiClient.get<Encounter>(`/encounters/${id}`);
      return response;
    } catch (error) {
      console.error("Get encounter error:", error);
      throw error;
    }
  }

  async createEncounter(data: CreateEncounterDto): Promise<Encounter> {
    try {
      const response = await apiClient.post<Encounter>('/encounters', data);
      return response;
    } catch (error) {
      console.error("Create encounter error:", error);
      throw error;
    }
  }

  async updateEncounter(data: UpdateEncounterDto): Promise<Encounter> {
    try {
      const response = await apiClient.patch<Encounter>('/encounters', data);
      return response;
    } catch (error) {
      console.error("Update encounter error:", error);
      throw error;
    }
  }

  async lockEncounter(data: LockEncounterDto): Promise<Encounter> {
    try {
      const response = await apiClient.post<Encounter>('/encounters/lock', data);
      return response;
    } catch (error) {
      console.error("Lock encounter error:", error);
      throw error;
    }
  }
}

export const encountersService = new EncountersService();