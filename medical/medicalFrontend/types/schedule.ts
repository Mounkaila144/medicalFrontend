export enum RepeatType {
  NONE = 'none',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly'
}

export interface Availability {
  id: string;
  practitionerId: string;
  weekday: number; // 0 = Sunday, 1 = Monday, etc.
  start: string; // Time format: "09:00"
  end: string; // Time format: "17:00"
  repeat: RepeatType;
}

export interface AvailabilitySlot {
  startAt: Date;
  endAt: Date;
  duration: number; // in minutes
  available: boolean;
}

export interface WeeklySchedule {
  [key: number]: Availability[]; // weekday as key
}

export interface PractitionerSchedule {
  practitioner: {
    id: string;
    firstName: string;
    lastName: string;
    specialty?: string;
  };
  availabilities: Availability[];
  timeSlots: AvailabilitySlot[];
}

export interface CreateAvailabilityDto {
  practitionerId: string;
  weekday: number;
  start: string;
  end: string;
  repeat: RepeatType;
}

export interface UpdateAvailabilityDto {
  weekday?: number;
  start?: string;
  end?: string;
  repeat?: RepeatType;
}

export interface ScheduleStats {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  utilizationRate: number;
}