'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { appointmentService } from '@/services/appointment-service';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Patient, Practitioner } from '@/types';

// Form validation schema
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, 'Le patient est requis'),
  practitionerId: z.string().min(1, 'Le praticien est requis'),
  date: z.date({
    required_error: 'La date est requise',
  }),
  startTime: z.string().min(1, 'L\'heure de début est requise'),
  endTime: z.string().min(1, 'L\'heure de fin est requise'),
  reason: z.string().min(1, 'Le motif est requis'),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  room: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  appointment?: Appointment;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AppointmentForm({ appointment, onSuccess, onCancel }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const isEditing = !!appointment;

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: appointment?.patientId || '',
      practitionerId: appointment?.practitionerId || '',
      date: appointment ? new Date(appointment.startAt) : undefined,
      startTime: appointment ? format(new Date(appointment.startAt), 'HH:mm') : '',
      endTime: appointment ? format(new Date(appointment.endAt), 'HH:mm') : '',
      reason: appointment?.reason || '',
      urgency: appointment?.urgency || 'NORMAL',
      room: appointment?.room || '',
      notes: '',
    },
  });

  // Load form data (patients and practitioners)
  const loadFormData = async () => {
    try {
      setLoadingData(true);
      
      // Mock patients data for development
      const mockPatients: Patient[] = [
        { id: 'pat-1', firstName: 'John', lastName: 'Smith', mrn: 'MRN001', dob: '1985-01-15', gender: 'M', phone: '123-456-7890', address: { street: '123 Main St', city: 'Anytown', state: 'State', zipCode: '12345', country: 'Country' }, clinicId: 'clinic-1', createdAt: '', updatedAt: '' },
        { id: 'pat-2', firstName: 'Emma', lastName: 'Wilson', mrn: 'MRN002', dob: '1990-05-20', gender: 'F', phone: '123-456-7891', address: { street: '456 Oak Ave', city: 'Anytown', state: 'State', zipCode: '12345', country: 'Country' }, clinicId: 'clinic-1', createdAt: '', updatedAt: '' },
        { id: 'pat-3', firstName: 'Michael', lastName: 'Brown', mrn: 'MRN003', dob: '1978-12-10', gender: 'M', phone: '123-456-7892', address: { street: '789 Pine Rd', city: 'Anytown', state: 'State', zipCode: '12345', country: 'Country' }, clinicId: 'clinic-1', createdAt: '', updatedAt: '' },
        { id: 'pat-4', firstName: 'Sophie', lastName: 'Martinez', mrn: 'MRN004', dob: '1995-03-08', gender: 'F', phone: '123-456-7893', address: { street: '321 Elm St', city: 'Anytown', state: 'State', zipCode: '12345', country: 'Country' }, clinicId: 'clinic-1', createdAt: '', updatedAt: '' },
      ];
      
      // Mock practitioners data for development
      const mockPractitioners: Practitioner[] = [
        { id: 'prac-1', firstName: 'Dr. Sarah', lastName: 'Johnson', speciality: 'GENERAL_PRACTICE', email: 'sarah.johnson@clinic.com', phoneNumber: '555-0101', workingHours: [], slotDuration: 30, color: '#3B82F6', isActive: true, tenantId: 'tenant-1' },
        { id: 'prac-2', firstName: 'Dr. James', lastName: 'Williams', speciality: 'CARDIOLOGY', email: 'james.williams@clinic.com', phoneNumber: '555-0102', workingHours: [], slotDuration: 30, color: '#EF4444', isActive: true, tenantId: 'tenant-1' },
        { id: 'prac-3', firstName: 'Dr. Emily', lastName: 'Brown', speciality: 'PEDIATRICS', email: 'emily.brown@clinic.com', phoneNumber: '555-0103', workingHours: [], slotDuration: 30, color: '#10B981', isActive: true, tenantId: 'tenant-1' },
        { id: 'prac-4', firstName: 'Dr. Robert', lastName: 'Davis', speciality: 'DERMATOLOGY', email: 'robert.davis@clinic.com', phoneNumber: '555-0104', workingHours: [], slotDuration: 30, color: '#F59E0B', isActive: true, tenantId: 'tenant-1' },
      ];
      
      setPatients(mockPatients);
      setPractitioners(mockPractitioners);
      
      console.log('Loaded mock data:', { patients: mockPatients.length, practitioners: mockPractitioners.length });
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setIsLoading(true);
      console.log('Form data received:', data);

      // Combine date and time
      const startDateTime = new Date(data.date);
      const [startHours, startMinutes] = data.startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(data.date);
      const [endHours, endMinutes] = data.endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Find patient and practitioner data for complete appointment
      const selectedPatient = patients.find(p => p.id === data.patientId);
      const selectedPractitioner = practitioners.find(p => p.id === data.practitionerId);

      const appointmentData = {
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        reason: data.reason,
        urgency: data.urgency,
        room: data.room || undefined,
        status: 'SCHEDULED' as AppointmentStatus,
        patient: selectedPatient ? {
          id: selectedPatient.id,
          firstName: selectedPatient.firstName,
          lastName: selectedPatient.lastName,
          mrn: selectedPatient.mrn
        } : undefined,
        practitioner: selectedPractitioner ? {
          id: selectedPractitioner.id,
          firstName: selectedPractitioner.firstName,
          lastName: selectedPractitioner.lastName,
          speciality: selectedPractitioner.speciality
        } : undefined,
      };

      console.log('Appointment data to send:', appointmentData);

      if (isEditing) {
        await appointmentService.updateAppointment(appointment.id, appointmentData);
        toast.success('Rendez-vous mis à jour avec succès');
      } else {
        const result = await appointmentService.createAppointment(appointmentData);
        console.log('Created appointment result:', result);
        toast.success('Rendez-vous créé avec succès');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde du rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un patient" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.mrn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="practitionerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Praticien *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un praticien" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {practitioners.map((practitioner) => (
                      <SelectItem key={practitioner.id} value={practitioner.id}>
                        {practitioner.firstName} {practitioner.lastName} - {practitioner.speciality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de début *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de fin *</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgence</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Niveau d'urgence" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Faible</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">Élevé</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="room"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salle (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Salle 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motif du rendez-vous *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez le motif du rendez-vous..."
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Mettre à jour' : 'Créer'} le rendez-vous
          </Button>
        </div>
      </form>
    </Form>
  );
}