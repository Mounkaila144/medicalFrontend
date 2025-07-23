import { DashboardData } from "@/types/dashboard";
import { apiClient } from "@/lib/api";

class DashboardService {
  async getDashboardData(period: string = 'MONTHLY'): Promise<any> {
    try {
      const response = await apiClient.get(`/reports/dashboard?period=${period}`);
      
      // Transform API response to match frontend interface
      // apiClient.get returns the data directly, not wrapped in .data
      const apiData = response;
      
      console.log('🔍 Dashboard API Response:', apiData);
      
      // Handle the new API structure with metrics nested object
      const metrics = apiData.metrics || {};
      const charts = apiData.charts || {};
      
      return {
        totalPatients: metrics.totalPatients || 0,
        newPatients: 0, // Will calculate from alerts if available
        appointmentsToday: metrics.totalAppointments || 0, // Adjust based on actual API field
        appointmentCompletedToday: apiData.appointmentsByStatus?.COMPLETED || 0,
        appointmentCanceledToday: (apiData.appointmentsByStatus?.CANCELLED || 0) + (apiData.appointmentsByStatus?.NO_SHOW || 0),
        averageWaitTime: metrics.averageWaitTime || 15,
        waitTimeChange: 0, // Not implemented yet in API
        monthlyRevenue: metrics.totalRevenue || 0,
        revenueChange: 0, // Not implemented yet in API
        appointmentsOverview: apiData.appointmentsOverview || [],
        recentAppointments: (apiData.recentAppointments || []).map(apt => ({
          id: apt.id,
          patientName: apt.patientName,
          purpose: apt.purpose || 'Consultation',
          time: apt.appointmentDate,
          status: apt.status?.toLowerCase() || 'scheduled'
        })),
        // Additional data from API
        pendingInvoices: apiData.pendingInvoices || 0,
        upcomingAppointments: (apiData.upcomingAppointments || []).map(apt => ({
          id: apt.id,
          patient: apt.patient,
          time: new Date(apt.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          practitioner: apt.practitioner,
          type: apt.type || 'Consultation'
        })),
        appointmentsByStatus: apiData.appointmentsByStatus || {},
        alerts: apiData.alerts || [],
        
        // Additional chart data
        dailyRevenue: charts.dailyRevenue || [],
        appointmentsByType: charts.appointmentsByType || []
      };
    } catch (error) {
      console.error("Get dashboard data error:", error);
      
      // Fallback to mock data in case of error
      return this.getMockData();
    }
  }

  private getMockData(): DashboardData {
    return {
      totalPatients: 0,
      newPatients: 0,
      appointmentsToday: 0,
      appointmentCompletedToday: 0,
      appointmentCanceledToday: 0,
      averageWaitTime: 0,
      waitTimeChange: 0,
      monthlyRevenue: 0,
      revenueChange: 0,
      appointmentsOverview: [],
      recentAppointments: []
    };
  }
}

export const dashboardService = new DashboardService();