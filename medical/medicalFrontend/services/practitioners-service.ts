import { apiClient } from "@/lib/api";

export interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  color: string;
  userId?: string;
  email?: string;
  phoneNumber?: string;
  slotDuration?: number;
  workingHours?: WorkingHours[];
  availabilities?: any[]; // Backend returns availabilities instead of workingHours
}

export interface WorkingHours {
  dayOfWeek: DayOfWeek;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum Speciality {
  GENERAL_MEDICINE = 'GENERAL_MEDICINE',
  PEDIATRICS = 'PEDIATRICS',
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  NEUROLOGY = 'NEUROLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  GYNECOLOGY = 'GYNECOLOGY',
  OPHTHALMOLOGY = 'OPHTHALMOLOGY',
  DENTISTRY = 'DENTISTRY',
  PSYCHIATRY = 'PSYCHIATRY',
}

export interface CreatePractitionerDto {
  firstName: string;
  lastName: string;
  speciality: Speciality;
  email?: string;
  phoneNumber: string;
  workingHours: WorkingHours[];
  slotDuration: number;
  color: string;
}

class PractitionersService {
  async getPractitioners(): Promise<Practitioner[]> {
    try {
      const response = await apiClient.get<Practitioner[]>('/practitioners');
      
      // Transform availabilities to workingHours format for UI compatibility
      return response.map(practitioner => ({
        ...practitioner,
        workingHours: this.convertAvailabilitiesToWorkingHours(practitioner.availabilities || []),
        // Ensure email and phoneNumber are available (fallback to user data if needed)
        email: practitioner.email || practitioner.user?.email || '',
        phoneNumber: practitioner.phoneNumber || '', 
        slotDuration: practitioner.slotDuration || 30,
      }));
    } catch (error) {
      console.error("Get practitioners error:", error);
      throw error;
    }
  }

  private convertAvailabilitiesToWorkingHours(availabilities: any[]): WorkingHours[] {
    const weekdayMap: Record<number, DayOfWeek> = {
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
      7: DayOfWeek.SUNDAY,
    };

    const groupedByDay = availabilities.reduce((acc, availability) => {
      const dayOfWeek = weekdayMap[availability.weekday];
      if (!dayOfWeek) return acc;

      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = [];
      }
      acc[dayOfWeek].push({
        start: availability.start,
        end: availability.end,
      });
      return acc;
    }, {} as Record<DayOfWeek, TimeSlot[]>);

    return Object.entries(groupedByDay).map(([dayOfWeek, slots]) => ({
      dayOfWeek: dayOfWeek as DayOfWeek,
      slots: slots.sort((a, b) => a.start.localeCompare(b.start)),
    }));
  }

  async createPractitioner(data: CreatePractitionerDto): Promise<Practitioner> {
    try {
      const response = await apiClient.post<Practitioner>('/practitioners', data);
      return response;
    } catch (error) {
      console.error("Create practitioner error:", error);
      throw error;
    }
  }

  async updatePractitioner(id: string, data: Partial<CreatePractitionerDto>): Promise<Practitioner> {
    try {
      const response = await apiClient.put<Practitioner>(`/practitioners/${id}`, data);
      return response;
    } catch (error: any) {
      console.error("Update practitioner error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de mise à jour des praticiens non encore implémenté dans le backend');
      }
      throw error;
    }
  }

  async deletePractitioner(id: string): Promise<void> {
    try {
      await apiClient.delete(`/practitioners/${id}`);
    } catch (error: any) {
      console.error("Delete practitioner error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de suppression des praticiens non encore implémenté dans le backend');
      }
      throw error;
    }
  }

  async getPractitioner(id: string): Promise<Practitioner> {
    try {
      const response = await apiClient.get<Practitioner>(`/practitioners/${id}`);
      return response;
    } catch (error: any) {
      console.error("Get practitioner error:", error);
      if (error.status === 404) {
        throw new Error('Endpoint de récupération d\'un praticien spécifique non encore implémenté dans le backend');
      }
      throw error;
    }
  }
}

export const practitionersService = new PractitionersService();