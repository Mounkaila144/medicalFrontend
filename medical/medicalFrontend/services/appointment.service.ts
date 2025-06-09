import { apiClient, createQueryString } from '@/lib/api';
import { Appointment, AppointmentForm, WaitQueueEntry, Priority, PaginatedResponse } from '@/types';

export interface AppointmentSearchParams {
  date?: string;
  practitionerId?: string;
  patientId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface WaitQueueData {
  patientId: string;
  practitionerId: string;
  priority: Priority;
  reason: string;
}

export class AppointmentService {
  // Get appointments with filters
  static async getAppointments(params: AppointmentSearchParams = {}): Promise<PaginatedResponse<Appointment>> {
    const queryString = createQueryString(params);
    const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
    return apiClient.get<PaginatedResponse<Appointment>>(endpoint);
  }

  // Get appointment by ID
  static async getAppointmentById(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  }

  // Create new appointment
  static async createAppointment(appointmentData: AppointmentForm): Promise<Appointment> {
    return apiClient.post<Appointment>('/appointments', appointmentData);
  }

  // Update appointment
  static async updateAppointment(id: string, appointmentData: Partial<AppointmentForm>): Promise<Appointment> {
    return apiClient.patch<Appointment>(`/appointments/${id}`, appointmentData);
  }

  // Cancel appointment
  static async cancelAppointment(id: string, data: {
    cancellationReason: string;
    notifyPatient?: boolean;
  }): Promise<Appointment> {
    return apiClient.patch<Appointment>(`/appointments/${id}/cancel`, data);
  }

  // Delete appointment
  static async deleteAppointment(id: string): Promise<void> {
    return apiClient.delete<void>(`/appointments/${id}`);
  }

  // Get appointments for a specific date
  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(`/appointments?date=${date}`);
  }

  // Get appointments for date range
  static async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    const queryString = createQueryString({ startDate, endDate });
    return apiClient.get<Appointment[]>(`/appointments/range?${queryString}`);
  }

  // Wait Queue Management
  static async addToWaitQueue(data: WaitQueueData): Promise<WaitQueueEntry> {
    return apiClient.post<WaitQueueEntry>('/wait-queue', data);
  }

  static async getWaitQueue(): Promise<WaitQueueEntry[]> {
    return apiClient.get<WaitQueueEntry[]>('/wait-queue');
  }

  static async updateWaitQueueEntry(id: string, data: Partial<WaitQueueData>): Promise<WaitQueueEntry> {
    return apiClient.patch<WaitQueueEntry>(`/wait-queue/${id}`, data);
  }

  static async removeFromWaitQueue(id: string): Promise<void> {
    return apiClient.delete<void>(`/wait-queue/${id}`);
  }

  // Practitioner Schedule (for practitioner portal)
  static async getPractitionerTodayAppointments(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/practitioner/schedule/appointments');
  }

  static async getPractitionerAppointmentsByDate(date: string): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(`/practitioner/schedule/appointments?date=${date}`);
  }

  static async getPractitionerWeeklyAppointments(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/practitioner/schedule/appointments/week');
  }

  static async getPractitionerMonthlyAppointments(): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>('/practitioner/schedule/appointments/month');
  }

  static async getPractitionerAppointmentById(id: string): Promise<Appointment> {
    return apiClient.get<Appointment>(`/practitioner/schedule/appointments/${id}`);
  }

  static async getPractitionerAvailability(): Promise<any> {
    return apiClient.get('/practitioner/schedule/availability');
  }

  static async getPractitionerStats(): Promise<{
    todayAppointments: number;
    weekAppointments: number;
    monthAppointments: number;
    completionRate: number;
  }> {
    return apiClient.get('/practitioner/schedule/stats');
  }

  // Appointment statistics
  static async getAppointmentStats(period: 'day' | 'week' | 'month' = 'month'): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byPractitioner: Array<{ practitionerId: string; name: string; count: number }>;
    byUrgency: Record<string, number>;
    averageDuration: number;
  }> {
    return apiClient.get(`/appointments/stats?period=${period}`);
  }

  // Check availability
  static async checkAvailability(practitionerId: string, date: string, duration: number): Promise<{
    available: boolean;
    suggestedSlots: Array<{ start: string; end: string }>;
  }> {
    const queryString = createQueryString({ practitionerId, date, duration });
    return apiClient.get(`/appointments/availability?${queryString}`);
  }

  // Bulk operations
  static async bulkUpdateAppointments(appointmentIds: string[], updates: Partial<AppointmentForm>): Promise<Appointment[]> {
    return apiClient.patch<Appointment[]>('/appointments/bulk-update', {
      appointmentIds,
      updates
    });
  }

  static async bulkCancelAppointments(appointmentIds: string[], reason: string): Promise<void> {
    return apiClient.patch<void>('/appointments/bulk-cancel', {
      appointmentIds,
      cancellationReason: reason
    });
  }
} 