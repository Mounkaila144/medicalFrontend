import { DashboardData } from "@/types/dashboard";
import { api } from "@/services/api-service";

// Mock data for development
const MOCK_DASHBOARD_DATA: DashboardData = {
  totalPatients: 1248,
  newPatients: 32,
  appointmentsToday: 24,
  appointmentCompletedToday: 15,
  appointmentCanceledToday: 2,
  averageWaitTime: 12,
  waitTimeChange: -5,
  monthlyRevenue: 45600,
  revenueChange: 12,
  appointmentsOverview: [
    { date: "2024-03-01", scheduled: 18, completed: 15, canceled: 2 },
    { date: "2024-03-02", scheduled: 22, completed: 19, canceled: 1 },
    { date: "2024-03-03", scheduled: 15, completed: 12, canceled: 2 },
    { date: "2024-03-04", scheduled: 25, completed: 20, canceled: 3 },
    { date: "2024-03-05", scheduled: 20, completed: 17, canceled: 1 },
    { date: "2024-03-06", scheduled: 24, completed: 21, canceled: 2 },
    { date: "2024-03-07", scheduled: 19, completed: 16, canceled: 1 }
  ],
  recentAppointments: [
    {
      id: "apt-1",
      patientName: "Alice Johnson",
      purpose: "Annual Checkup",
      time: "2024-03-07T09:00:00Z",
      status: "completed"
    },
    {
      id: "apt-2",
      patientName: "Bob Smith",
      purpose: "Follow-up",
      time: "2024-03-07T10:30:00Z",
      status: "scheduled"
    },
    {
      id: "apt-3",
      patientName: "Carol White",
      purpose: "Consultation",
      time: "2024-03-07T11:15:00Z",
      status: "canceled"
    },
    {
      id: "apt-4",
      patientName: "David Brown",
      purpose: "Vaccination",
      time: "2024-03-07T14:00:00Z",
      status: "scheduled"
    }
  ]
};

class DashboardService {
  async getDashboardData(): Promise<DashboardData> {
    try {
      // In a real app, this would be an API call
      // const response = await api.get("/dashboard");
      // return response.data;
      
      // For development, return mock data after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_DASHBOARD_DATA;
    } catch (error) {
      console.error("Get dashboard data error:", error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();