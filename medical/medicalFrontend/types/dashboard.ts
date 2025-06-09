export interface AppointmentOverview {
  date: string;
  scheduled: number;
  completed: number;
  canceled: number;
}

export interface RecentAppointment {
  id: string;
  patientName: string;
  purpose: string;
  time: string;
  status: 'scheduled' | 'completed' | 'canceled' | 'no-show';
}

export interface DashboardData {
  totalPatients: number;
  newPatients: number;
  appointmentsToday: number;
  appointmentCompletedToday: number;
  appointmentCanceledToday: number;
  averageWaitTime: number;
  waitTimeChange: number;
  monthlyRevenue: number;
  revenueChange: number;
  appointmentsOverview: AppointmentOverview[];
  recentAppointments: RecentAppointment[];
}