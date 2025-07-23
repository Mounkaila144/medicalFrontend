export type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  startAt: string;
  endAt: string;
  room?: string;
  reason: string;
  urgency: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: AppointmentStatus;
  cancellationReason?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
  };
  practitioner?: {
    id: string;
    firstName: string;
    lastName: string;
    speciality: string;
  };
  // Legacy fields for compatibility
  patientName?: string;
  doctorName?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  createdAt?: string;
  updatedAt?: string;
}