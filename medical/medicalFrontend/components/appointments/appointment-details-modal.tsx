'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Appointment } from '@/types/appointment';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  AlertTriangle,
  FileText,
  Phone,
  IdCard,
} from 'lucide-react';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * AppointmentDetailsModal - A modal component for displaying detailed appointment information
 * 
 * Features:
 * - Read-only view of appointment details
 * - Responsive design with proper spacing
 * - Status and urgency indicators with appropriate colors
 * - Patient and practitioner information display
 * - Date/time formatting with duration calculation
 * - Conditional rendering of cancellation reasons
 * - Uses shadcn/ui Dialog component for consistent styling
 * 
 * @param appointment - The appointment object to display (null will not render)
 * @param open - Boolean to control modal visibility
 * @param onOpenChange - Callback function when modal visibility changes
 */
export function AppointmentDetailsModal({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  const getStatusBadgeVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'scheduled':
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'canceled':
      case 'cancelled':
        return 'destructive';
      case 'no-show':
      case 'no_show':
        return 'outline';
      case 'in-progress':
      case 'in_progress':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'outline';
      case 'normal':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'urgent':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'normal':
        return 'text-blue-600 dark:text-blue-400';
      case 'low':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE dd MMMM yyyy', { locale: fr });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatDuration = () => {
    if (!appointment.startAt || !appointment.endAt) return 'Non spécifiée';
    
    try {
      const start = new Date(appointment.startAt);
      const end = new Date(appointment.endAt);
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      if (durationMinutes < 60) {
        return `${durationMinutes} min`;
      } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
      }
    } catch {
      return 'Non spécifiée';
    }
  };

  const patientName = appointment.patientName || 
    (appointment.patient ? `${appointment.patient.firstName} ${appointment.patient.lastName}` : 'Patient inconnu');
  
  const practitionerName = appointment.doctorName || 
    (appointment.practitioner ? `${appointment.practitioner.firstName} ${appointment.practitioner.lastName}` : 'Praticien inconnu');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Détails du rendez-vous
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Urgency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Statut:</span>
              <Badge variant={getStatusBadgeVariant(appointment.status)}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${getUrgencyColor(appointment.urgency)}`} />
              <Badge variant={getUrgencyBadgeVariant(appointment.urgency)}>
                Urgence: {appointment.urgency}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Date and Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(appointment.startAt || appointment.startTime || '')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Début:</span>
                  <span>{formatTime(appointment.startAt || appointment.startTime || '')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Fin:</span>
                  <span>{formatTime(appointment.endAt || appointment.endTime || '')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Durée:</span>
                  <span>{formatDuration()}</span>
                </div>
              </div>
            </div>

            {/* Room Information */}
            {appointment.room && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Localisation
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Salle:</span>
                    <span>{appointment.room}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Information Patient
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nom:</span>
                  <span>{patientName}</span>
                </div>
                {appointment.patient?.mrn && (
                  <div className="flex items-center gap-2 text-sm">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">MRN:</span>
                    <span className="font-mono">{appointment.patient.mrn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Practitioner Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Information Praticien
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Nom:</span>
                  <span>{practitionerName}</span>
                </div>
                {appointment.practitioner?.speciality && (
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Spécialité:</span>
                    <span>{appointment.practitioner.speciality}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Appointment Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Détails du rendez-vous
            </h3>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Motif:</span>
                <div className="mt-1 p-3 bg-muted rounded-md">
                  <p className="text-muted-foreground">
                    {appointment.reason || appointment.purpose || 'Aucun motif spécifié'}
                  </p>
                </div>
              </div>
              
              {appointment.cancellationReason && (
                <div className="text-sm">
                  <span className="font-medium text-red-600">Motif d&apos;annulation:</span>
                  <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-red-700 dark:text-red-300">
                      {appointment.cancellationReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          {(appointment.createdAt || appointment.updatedAt) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Informations système</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                  {appointment.createdAt && (
                    <div>
                      <span className="font-medium">Créé le:</span>{' '}
                      {format(new Date(appointment.createdAt), 'dd/MM/yyyy à HH:mm')}
                    </div>
                  )}
                  {appointment.updatedAt && (
                    <div>
                      <span className="font-medium">Modifié le:</span>{' '}
                      {format(new Date(appointment.updatedAt), 'dd/MM/yyyy à HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}