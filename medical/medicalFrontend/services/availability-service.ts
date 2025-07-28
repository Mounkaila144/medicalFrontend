import { 
  Availability, 
  AvailabilitySlot, 
  PractitionerSchedule, 
  CreateAvailabilityDto, 
  UpdateAvailabilityDto,
  RepeatType,
  ScheduleStats
} from "@/types/schedule";
import { api } from "@/services/api-service";

interface GetAvailabilityParams {
  practitionerId?: string;
  date?: Date;
  weekday?: number;
}

interface GetTimeSlotsParams {
  practitionerId: string;
  date: Date;
}

// Mock data for development
const MOCK_PRACTITIONERS = [
  { id: "prac-1", firstName: "Dr. Sarah", lastName: "Johnson", specialty: "Cardiology" },
  { id: "prac-2", firstName: "Dr. James", lastName: "Williams", specialty: "Pediatrics" },
  { id: "prac-3", firstName: "Dr. Emily", lastName: "Brown", specialty: "Dermatology" }
];

const MOCK_AVAILABILITIES: Availability[] = [
  {
    id: "avail-1",
    practitionerId: "prac-1",
    weekday: 1, // Monday
    start: "09:00",
    end: "17:00",
    repeat: RepeatType.WEEKLY
  },
  {
    id: "avail-2", 
    practitionerId: "prac-1",
    weekday: 2, // Tuesday
    start: "09:00",
    end: "17:00",
    repeat: RepeatType.WEEKLY
  },
  {
    id: "avail-3",
    practitionerId: "prac-1",
    weekday: 3, // Wednesday
    start: "09:00",
    end: "12:00",
    repeat: RepeatType.WEEKLY
  },
  {
    id: "avail-4",
    practitionerId: "prac-1",
    weekday: 4, // Thursday
    start: "14:00",
    end: "18:00",
    repeat: RepeatType.WEEKLY
  },
  {
    id: "avail-5",
    practitionerId: "prac-1",
    weekday: 5, // Friday
    start: "08:00",
    end: "16:00",
    repeat: RepeatType.WEEKLY
  }
];

class AvailabilityService {
  // Generate time slots for a specific date and practitioner
  private generateTimeSlots(availability: Availability, date: Date, bookedSlots: Date[] = []): AvailabilitySlot[] {
    const slots: AvailabilitySlot[] = [];
    const [startHour, startMinute] = availability.start.split(':').map(Number);
    const [endHour, endMinute] = availability.end.split(':').map(Number);
    
    const slotDuration = 30; // 30 minutes per slot
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const slotEndTime = new Date(currentTime);
      slotEndTime.setMinutes(currentTime.getMinutes() + slotDuration);
      
      if (slotEndTime <= endTime) {
        const isBooked = bookedSlots.some(bookedSlot => 
          bookedSlot.getTime() === currentTime.getTime()
        );
        
        slots.push({
          startAt: new Date(currentTime),
          endAt: new Date(slotEndTime),
          duration: slotDuration,
          available: !isBooked
        });
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
    }
    
    return slots;
  }

  async getAvailabilities(params: GetAvailabilityParams = {}): Promise<Availability[]> {
    try {
      // In a real app, this would be an API call
      // const response = await api.get("/availabilities", { params });
      // return response.data;
      
      // For development, return filtered mock data
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredAvailabilities = [...MOCK_AVAILABILITIES];
      
      if (params.practitionerId) {
        filteredAvailabilities = filteredAvailabilities.filter(avail => 
          avail.practitionerId === params.practitionerId
        );
      }
      
      if (params.weekday !== undefined) {
        filteredAvailabilities = filteredAvailabilities.filter(avail => 
          avail.weekday === params.weekday
        );
      }
      
      return filteredAvailabilities;
    } catch (error) {
      console.error("Get availabilities error:", error);
      throw error;
    }
  }

  async getTimeSlots(params: GetTimeSlotsParams): Promise<AvailabilitySlot[]> {
    try {
      // In a real app, this would be an API call to get available slots
      // const response = await api.get(`/practitioner/schedule/availability`, {
      //   params: { practitionerId: params.practitionerId, date: params.date.toISOString() }
      // });
      // return response.data;
      
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const weekday = params.date.getDay();
      const availabilities = await this.getAvailabilities({
        practitionerId: params.practitionerId,
        weekday: weekday
      });
      
      // Mock some booked slots for demonstration
      const bookedSlots: Date[] = [];
      if (weekday === 1) { // Monday
        const slot1 = new Date(params.date);
        slot1.setHours(10, 0, 0, 0);
        const slot2 = new Date(params.date);
        slot2.setHours(14, 30, 0, 0);
        bookedSlots.push(slot1, slot2);
      }
      
      let allSlots: AvailabilitySlot[] = [];
      
      for (const availability of availabilities) {
        const slots = this.generateTimeSlots(availability, params.date, bookedSlots);
        allSlots = [...allSlots, ...slots];
      }
      
      return allSlots.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    } catch (error) {
      console.error("Get time slots error:", error);
      throw error;
    }
  }

  async getPractitionerSchedule(practitionerId: string, date?: Date): Promise<PractitionerSchedule> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const practitioner = MOCK_PRACTITIONERS.find(p => p.id === practitionerId);
      if (!practitioner) {
        throw new Error("Practitioner not found");
      }

      const availabilities = await this.getAvailabilities({ practitionerId });
      
      let timeSlots: AvailabilitySlot[] = [];
      if (date) {
        timeSlots = await this.getTimeSlots({ practitionerId, date });
      }

      return {
        practitioner,
        availabilities,
        timeSlots
      };
    } catch (error) {
      console.error("Get practitioner schedule error:", error);
      throw error;
    }
  }

  async createAvailability(data: CreateAvailabilityDto): Promise<Availability> {
    try {
      // In a real app, this would be an API call
      // const response = await api.post("/availabilities", data);
      // return response.data;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newAvailability: Availability = {
        id: `avail-${Date.now()}`,
        ...data
      };
      
      return newAvailability;
    } catch (error) {
      console.error("Create availability error:", error);
      throw error;
    }
  }

  async updateAvailability(id: string, data: UpdateAvailabilityDto): Promise<Availability> {
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/availabilities/${id}`, data);
      // return response.data;
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const availability = MOCK_AVAILABILITIES.find(a => a.id === id);
      if (!availability) {
        throw new Error("Availability not found");
      }
      
      const updatedAvailability: Availability = {
        ...availability,
        ...data
      };
      
      return updatedAvailability;
    } catch (error) {
      console.error("Update availability error:", error);
      throw error;
    }
  }

  async deleteAvailability(id: string): Promise<void> {
    try {
      // In a real app, this would be an API call
      // await api.delete(`/availabilities/${id}`);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Delete availability error:", error);
      throw error;
    }
  }

  async getScheduleStats(practitionerId: string, date: Date): Promise<ScheduleStats> {
    try {
      const timeSlots = await this.getTimeSlots({ practitionerId, date });
      
      const totalSlots = timeSlots.length;
      const availableSlots = timeSlots.filter(slot => slot.available).length;
      const bookedSlots = totalSlots - availableSlots;
      const utilizationRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
      
      return {
        totalSlots,
        availableSlots,
        bookedSlots,
        utilizationRate: Math.round(utilizationRate * 100) / 100
      };
    } catch (error) {
      console.error("Get schedule stats error:", error);
      throw error;
    }
  }

  // Helper method to get weekday names
  getWeekdayName(weekday: number): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[weekday] || 'Unknown';
  }

  // Helper method to format time
  formatTime(time: string): string {
    return time;
  }

  // Helper method to get all practitioners (for selection)
  async getPractitioners() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PRACTITIONERS;
  }
}

export const availabilityService = new AvailabilityService();