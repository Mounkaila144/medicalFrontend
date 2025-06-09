export type AppointmentStatus = "scheduled" | "completed" | "canceled" | "no-show";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}