import { Appointment } from "@/types/appointment";
import { api } from "@/services/api-service";

interface GetAppointmentsParams {
  date?: Date;
  status?: string;
  query?: string;
}

// Mock data for development
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    patientId: "pat-1",
    patientName: "John Smith",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Johnson",
    startTime: "2024-03-20T09:00:00Z",
    endTime: "2024-03-20T09:30:00Z",
    purpose: "Annual Checkup",
    status: "scheduled",
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z"
  },
  {
    id: "apt-2",
    patientId: "pat-2",
    patientName: "Emma Wilson",
    doctorId: "doc-1",
    doctorName: "Dr. Sarah Johnson",
    startTime: "2024-03-20T10:00:00Z",
    endTime: "2024-03-20T10:30:00Z",
    purpose: "Follow-up",
    status: "completed",
    notes: "Patient reported improvement",
    createdAt: "2024-03-15T11:00:00Z",
    updatedAt: "2024-03-15T11:00:00Z"
  },
  {
    id: "apt-3",
    patientId: "pat-3",
    patientName: "Michael Brown",
    doctorId: "doc-2",
    doctorName: "Dr. James Williams",
    startTime: "2024-03-20T11:00:00Z",
    endTime: "2024-03-20T11:30:00Z",
    purpose: "Consultation",
    status: "canceled",
    createdAt: "2024-03-15T12:00:00Z",
    updatedAt: "2024-03-15T12:00:00Z"
  }
];

class AppointmentService {
  async getAppointments(params: GetAppointmentsParams = {}): Promise<Appointment[]> {
    try {
      // In a real app, this would be an API call
      // const response = await api.get("/appointments", { params });
      // return response.data;
      
      // For development, return filtered mock data after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredAppointments = [...MOCK_APPOINTMENTS];
      
      if (params.date) {
        const dateStr = params.date.toISOString().split('T')[0];
        filteredAppointments = filteredAppointments.filter(apt => 
          apt.startTime.startsWith(dateStr)
        );
      }
      
      if (params.status) {
        filteredAppointments = filteredAppointments.filter(apt => 
          apt.status === params.status
        );
      }
      
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredAppointments = filteredAppointments.filter(apt => 
          apt.patientName.toLowerCase().includes(query) ||
          apt.doctorName.toLowerCase().includes(query) ||
          apt.purpose.toLowerCase().includes(query)
        );
      }
      
      return filteredAppointments;
    } catch (error) {
      console.error("Get appointments error:", error);
      throw error;
    }
  }
  
  async getAppointment(id: string): Promise<Appointment> {
    try {
      // In a real app, this would be an API call
      // const response = await api.get(`/appointments/${id}`);
      // return response.data;
      
      // For development, return mock data
      const appointment = MOCK_APPOINTMENTS.find(apt => apt.id === id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error) {
      console.error("Get appointment error:", error);
      throw error;
    }
  }
  
  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    try {
      // In a real app, this would be an API call
      // const response = await api.post("/appointments", data);
      // return response.data;
      
      // For development, return mock data
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Appointment;
      
      return newAppointment;
    } catch (error) {
      console.error("Create appointment error:", error);
      throw error;
    }
  }
  
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/appointments/${id}`, data);
      // return response.data;
      
      // For development, return mock data
      const appointment = await this.getAppointment(id);
      const updatedAppointment: Appointment = {
        ...appointment,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      return updatedAppointment;
    } catch (error) {
      console.error("Update appointment error:", error);
      throw error;
    }
  }
  
  async deleteAppointment(id: string): Promise<void> {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/appointments/${id}`);
      
      // For development, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Delete appointment error:", error);
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();