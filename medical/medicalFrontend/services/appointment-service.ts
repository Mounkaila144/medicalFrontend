import { Appointment } from "@/types/appointment";
import { api } from "@/services/api-service";

interface GetAppointmentsParams {
  date?: Date;
  status?: string;
  query?: string;
}

// Get today's date for mock data
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// Mock data for development
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    patientId: "pat-1",
    practitionerId: "prac-1",
    startAt: `${todayStr}T09:00:00Z`,
    endAt: `${todayStr}T09:30:00Z`,
    room: "101",
    reason: "Annual Checkup",
    urgency: "NORMAL",
    status: "SCHEDULED",
    patient: {
      id: "pat-1",
      firstName: "John",
      lastName: "Smith",
      mrn: "MRN001"
    },
    practitioner: {
      id: "prac-1",
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      speciality: "GENERAL_PRACTICE"
    },
    // Legacy compatibility
    patientName: "John Smith",
    doctorName: "Dr. Sarah Johnson",
    startTime: `${todayStr}T09:00:00Z`,
    endTime: `${todayStr}T09:30:00Z`,
    purpose: "Annual Checkup",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt-2",
    patientId: "pat-2",
    practitionerId: "prac-1",
    startAt: `${todayStr}T10:00:00Z`,
    endAt: `${todayStr}T10:30:00Z`,
    room: "102",
    reason: "Follow-up consultation",
    urgency: "NORMAL",
    status: "COMPLETED",
    patient: {
      id: "pat-2",
      firstName: "Emma",
      lastName: "Wilson",
      mrn: "MRN002"
    },
    practitioner: {
      id: "prac-1",
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      speciality: "GENERAL_PRACTICE"
    },
    // Legacy compatibility
    patientName: "Emma Wilson",
    doctorName: "Dr. Sarah Johnson",
    startTime: `${todayStr}T10:00:00Z`,
    endTime: `${todayStr}T10:30:00Z`,
    purpose: "Follow-up",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "apt-3",
    patientId: "pat-3",
    practitionerId: "prac-2",
    startAt: `${todayStr}T11:00:00Z`,
    endAt: `${todayStr}T11:30:00Z`,
    room: "103",
    reason: "Cardiology consultation",
    urgency: "HIGH",
    status: "CANCELLED",
    cancellationReason: "Patient unable to attend",
    patient: {
      id: "pat-3",
      firstName: "Michael",
      lastName: "Brown",
      mrn: "MRN003"
    },
    practitioner: {
      id: "prac-2",
      firstName: "Dr. James",
      lastName: "Williams",
      speciality: "CARDIOLOGY"
    },
    // Legacy compatibility
    patientName: "Michael Brown",
    doctorName: "Dr. James Williams",
    startTime: `${todayStr}T11:00:00Z`,
    endTime: `${todayStr}T11:30:00Z`,
    purpose: "Consultation",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

class AppointmentService {
  async getAppointments(params: GetAppointmentsParams = {}): Promise<Appointment[]> {
    try {
      // In a real app, this would be an API call
      // const response = await api.get("/appointments", { params });
      // return response.data;
      
      console.log('getAppointments called with params:', params);
      console.log('Total MOCK_APPOINTMENTS:', MOCK_APPOINTMENTS.length);
      
      // For development, return filtered mock data after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredAppointments = [...MOCK_APPOINTMENTS];
      console.log('Starting with appointments:', filteredAppointments.length);
      
      if (params.date) {
        const dateStr = params.date.toISOString().split('T')[0];
        console.log('Filtering by date:', dateStr);
        const beforeFilter = filteredAppointments.length;
        filteredAppointments = filteredAppointments.filter(apt => {
          const aptDate = (apt.startAt || apt.startTime)?.split('T')[0];
          console.log(`Appointment ${apt.id}: ${aptDate} === ${dateStr}?`, aptDate === dateStr);
          return aptDate === dateStr;
        });
        console.log(`After date filter: ${beforeFilter} -> ${filteredAppointments.length}`);
      }
      
      if (params.status) {
        console.log('Filtering by status:', params.status);
        const beforeFilter = filteredAppointments.length;
        filteredAppointments = filteredAppointments.filter(apt => 
          apt.status === params.status
        );
        console.log(`After status filter: ${beforeFilter} -> ${filteredAppointments.length}`);
      }
      
      if (params.query) {
        const query = params.query.toLowerCase();
        console.log('Filtering by query:', query);
        const beforeFilter = filteredAppointments.length;
        filteredAppointments = filteredAppointments.filter(apt => {
          const patientName = apt.patientName || (apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : '');
          const doctorName = apt.doctorName || (apt.practitioner ? `${apt.practitioner.firstName} ${apt.practitioner.lastName}` : '');
          const purpose = apt.purpose || apt.reason || '';
          
          return patientName.toLowerCase().includes(query) ||
                 doctorName.toLowerCase().includes(query) ||
                 purpose.toLowerCase().includes(query);
        });
        console.log(`After query filter: ${beforeFilter} -> ${filteredAppointments.length}`);
      }
      
      console.log('Final filtered appointments:', filteredAppointments);
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
      
      // For development, create and add to mock data
      const newAppointment: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: data.patientId!,
        practitionerId: data.practitionerId!,
        startAt: data.startAt!,
        endAt: data.endAt!,
        room: data.room,
        reason: data.reason!,
        urgency: data.urgency || 'NORMAL',
        status: data.status || 'SCHEDULED',
        cancellationReason: data.cancellationReason,
        patient: data.patient,
        practitioner: data.practitioner,
        // Legacy compatibility
        patientName: data.patientName || (data.patient ? `${data.patient.firstName} ${data.patient.lastName}` : ''),
        doctorName: data.doctorName || (data.practitioner ? `${data.practitioner.firstName} ${data.practitioner.lastName}` : ''),
        startTime: data.startAt,
        endTime: data.endAt,
        purpose: data.reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to mock data array
      MOCK_APPOINTMENTS.push(newAppointment);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      // For development, find and update the appointment in the mock array
      const appointmentIndex = MOCK_APPOINTMENTS.findIndex(apt => apt.id === id);
      if (appointmentIndex === -1) {
        throw new Error("Appointment not found");
      }
      
      const appointment = MOCK_APPOINTMENTS[appointmentIndex];
      const updatedAppointment: Appointment = {
        ...appointment,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      // Actually update the appointment in the array
      MOCK_APPOINTMENTS[appointmentIndex] = updatedAppointment;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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