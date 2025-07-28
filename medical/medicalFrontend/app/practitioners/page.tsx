'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  UserCheck,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
  Stethoscope,
  Users,
  Filter,
  X,
} from 'lucide-react';
import { 
  practitionersService, 
  Practitioner, 
  CreatePractitionerDto, 
  Speciality, 
  DayOfWeek, 
  WorkingHours,
  TimeSlot 
} from '@/services/practitioners-service';
import { useAuth } from '@/hooks/useAuth';

// Specialty labels in French
const specialityLabels: Record<Speciality, string> = {
  [Speciality.GENERAL_MEDICINE]: 'Médecine générale',
  [Speciality.PEDIATRICS]: 'Pédiatrie',
  [Speciality.CARDIOLOGY]: 'Cardiologie',
  [Speciality.DERMATOLOGY]: 'Dermatologie',
  [Speciality.NEUROLOGY]: 'Neurologie',
  [Speciality.ORTHOPEDICS]: 'Orthopédie',
  [Speciality.GYNECOLOGY]: 'Gynécologie',
  [Speciality.OPHTHALMOLOGY]: 'Ophtalmologie',
  [Speciality.DENTISTRY]: 'Dentisterie',
  [Speciality.PSYCHIATRY]: 'Psychiatrie',
};

// Day labels in French
const dayLabels: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: 'Lundi',
  [DayOfWeek.TUESDAY]: 'Mardi',
  [DayOfWeek.WEDNESDAY]: 'Mercredi',
  [DayOfWeek.THURSDAY]: 'Jeudi',
  [DayOfWeek.FRIDAY]: 'Vendredi',
  [DayOfWeek.SATURDAY]: 'Samedi',
  [DayOfWeek.SUNDAY]: 'Dimanche',
};

// Time slot validation schema
const timeSlotSchema = z.object({
  start: z.string().min(1, 'Heure de début requise'),
  end: z.string().min(1, 'Heure de fin requise'),
});

// Working hours validation schema
const workingHoursSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek, { errorMap: () => ({ message: 'Jour requis' }) }),
  slots: z.array(timeSlotSchema).min(1, 'Au moins un créneau requis'),
});

// Form validation schema
const practitionerFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  speciality: z.nativeEnum(Speciality, { errorMap: () => ({ message: 'La spécialité est requise' }) }),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phoneNumber: z.string().min(1, 'Le numéro de téléphone est requis'),
  slotDuration: z.number().min(5, 'Durée minimale: 5 minutes').max(120, 'Durée maximale: 120 minutes'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide (format: #RRGGBB)'),
  workingHours: z.array(workingHoursSchema).min(1, 'Au moins un jour de travail requis'),
});

type PractitionerFormData = z.infer<typeof practitionerFormSchema>;

export default function PractitionersPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialityFilter, setSpecialityFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const form = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      speciality: Speciality.GENERAL_MEDICINE,
      email: '',
      phoneNumber: '',
      slotDuration: 30,
      color: '#3b82f6',
      workingHours: [
        {
          dayOfWeek: DayOfWeek.MONDAY,
          slots: [{ start: '09:00', end: '17:00' }],
        },
      ],
    },
  });

  const editForm = useForm<PractitionerFormData>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      speciality: Speciality.GENERAL_MEDICINE,
      email: '',
      phoneNumber: '',
      slotDuration: 30,
      color: '#3b82f6',
      workingHours: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'workingHours',
  });

  const { fields: editFields, append: editAppend, remove: editRemove } = useFieldArray({
    control: editForm.control,
    name: 'workingHours',
  });

  // Load practitioners from API
  const loadPractitioners = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux praticiens');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const response = await practitionersService.getPractitioners();
      setPractitioners(response);
    } catch (error: any) {
      console.error('Error loading practitioners:', error);
      if (error.status === 401 || error.status === 403) {
        setError(`Erreur ${error.status}: ${error.message}`);
        toast.error(`Erreur d'authentification (${error.status})`);
        return;
      }
      setError('Erreur lors du chargement des praticiens');
      toast.error('Erreur lors du chargement des praticiens');
      setPractitioners([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load practitioners on mount and when search/filter changes
  useEffect(() => {
    loadPractitioners();
  }, []);

  // Filter practitioners based on search and filters
  const filteredPractitioners = practitioners.filter((practitioner) => {
    const matchesSearch = 
      practitioner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practitioner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practitioner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialityLabels[practitioner.specialty as Speciality]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpeciality = specialityFilter === 'all' || practitioner.specialty === specialityFilter;
    
    return matchesSearch && matchesSpeciality;
  });

  const handleCreatePractitioner = async (data: PractitionerFormData) => {
    try {
      setIsCreating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un praticien');
        router.push('/auth/login');
        return;
      }

      const practitionerData: CreatePractitionerDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        speciality: data.speciality,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        workingHours: data.workingHours,
        slotDuration: data.slotDuration,
        color: data.color,
      };

      await practitionersService.createPractitioner(practitionerData);
      await loadPractitioners();
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Praticien créé avec succès');
    } catch (error: any) {
      console.error('Error creating practitioner:', error);
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      toast.error('Erreur lors de la création du praticien');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePractitioner = async (data: PractitionerFormData) => {
    if (!selectedPractitioner) return;

    try {
      setIsUpdating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour modifier un praticien');
        router.push('/auth/login');
        return;
      }

      const practitionerData: Partial<CreatePractitionerDto> = {
        firstName: data.firstName,
        lastName: data.lastName,
        speciality: data.speciality,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        workingHours: data.workingHours,
        slotDuration: data.slotDuration,
        color: data.color,
      };

      await practitionersService.updatePractitioner(selectedPractitioner.id, practitionerData);
      await loadPractitioners();
      setIsEditModalOpen(false);
      toast.success('Praticien mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating practitioner:', error);
      toast.error('Erreur lors de la mise à jour du praticien');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePractitioner = async (practitionerId: string) => {
    try {
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer un praticien');
        router.push('/auth/login');
        return;
      }

      await practitionersService.deletePractitioner(practitionerId);
      await loadPractitioners();
      toast.success('Praticien supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting practitioner:', error);
      toast.error('Erreur lors de la suppression du praticien');
    }
  };

  const handleOpenEditModal = (practitioner: Practitioner) => {
    setSelectedPractitioner(practitioner);
    editForm.reset({
      firstName: practitioner.firstName,
      lastName: practitioner.lastName,
      speciality: practitioner.specialty as Speciality,
      email: practitioner.email || '',
      phoneNumber: practitioner.phoneNumber || '',
      slotDuration: practitioner.slotDuration || 30,
      color: practitioner.color,
      workingHours: practitioner.workingHours || [],
    });
    setIsEditModalOpen(true);
  };

  const addTimeSlot = (dayIndex: number, isEdit = false) => {
    const currentForm = isEdit ? editForm : form;
    const currentFields = isEdit ? editFields : fields;
    
    const workingHours = currentForm.getValues('workingHours');
    const updatedWorkingHours = [...workingHours];
    updatedWorkingHours[dayIndex].slots.push({ start: '09:00', end: '17:00' });
    currentForm.setValue('workingHours', updatedWorkingHours);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number, isEdit = false) => {
    const currentForm = isEdit ? editForm : form;
    
    const workingHours = currentForm.getValues('workingHours');
    const updatedWorkingHours = [...workingHours];
    if (updatedWorkingHours[dayIndex].slots.length > 1) {
      updatedWorkingHours[dayIndex].slots.splice(slotIndex, 1);
      currentForm.setValue('workingHours', updatedWorkingHours);
    }
  };

  if (!isAuthenticated && error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <CardTitle>Authentification requise</CardTitle>
              <CardDescription>
                Vous devez être connecté pour accéder à cette page.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/auth/login')} className="w-full">
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Praticiens</h1>
          <p className="text-gray-600 mt-1">
            Gérez les praticiens et leurs horaires de travail
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPractitioners} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau praticien
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau praticien</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du praticien ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePractitioner)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prénom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom *</FormLabel>
                            <FormControl>
                              <Input placeholder="Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="speciality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spécialité *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la spécialité" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(specialityLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
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
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Couleur *</FormLabel>
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <FormDescription>
                              Couleur pour identifier le praticien dans le planning
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+33123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="slotDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durée des créneaux (minutes) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                            />
                          </FormControl>
                          <FormDescription>
                            Durée par défaut des créneaux de rendez-vous (5-120 minutes)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Working Hours */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Horaires de travail</h3>
                      <p className="text-sm text-gray-500">Définissez les créneaux de disponibilité</p>
                    </div>

                    {fields.map((field, dayIndex) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <FormField
                            control={form.control}
                            name={`workingHours.${dayIndex}.dayOfWeek`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jour de la semaine</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-[150px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {Object.entries(dayLabels).map(([value, label]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(dayIndex)}
                            disabled={fields.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-2">
                          <Label>Créneaux horaires</Label>
                          {form.watch(`workingHours.${dayIndex}.slots`)?.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-2">
                              <FormField
                                control={form.control}
                                name={`workingHours.${dayIndex}.slots.${slotIndex}.start`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <span>à</span>
                              <FormField
                                control={form.control}
                                name={`workingHours.${dayIndex}.slots.${slotIndex}.end`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                                disabled={form.watch(`workingHours.${dayIndex}.slots`)?.length === 1}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTimeSlot(dayIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un créneau
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({
                        dayOfWeek: DayOfWeek.MONDAY,
                        slots: [{ start: '09:00', end: '17:00' }],
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un jour
                    </Button>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateModalOpen(false)}
                      disabled={isCreating}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Créer le praticien
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Praticiens</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{practitioners.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPractitioners.length} affiché(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spécialités</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(practitioners.map(p => p.specialty)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Spécialités différentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne créneaux</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {practitioners.length > 0 
                ? Math.round(practitioners.reduce((acc, p) => acc + (p.slotDuration || 30), 0) / practitioners.length)
                : 0
              } min
            </div>
            <p className="text-xs text-muted-foreground">
              Durée moyenne des créneaux
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Praticiens</CardTitle>
          <CardDescription>
            Recherchez et filtrez vos praticiens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou spécialité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Spécialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les spécialités</SelectItem>
                  {Object.entries(specialityLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSpecialityFilter('all');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-md text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadPractitioners}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Practitioners Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Praticien</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Créneaux</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des praticiens...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPractitioners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun praticien trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPractitioners.map((practitioner) => (
                    <TableRow key={practitioner.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Dr. {practitioner.firstName} {practitioner.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {practitioner.email || 'Pas d\'email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {specialityLabels[practitioner.specialty as Speciality] || practitioner.specialty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {practitioner.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {practitioner.slotDuration || 30} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: practitioner.color }}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions du praticien</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPractitioner(practitioner);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil complet
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(practitioner)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier les informations
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                // For now, open edit modal to manage working hours
                                handleOpenEditModal(practitioner);
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Gérer les disponibilités
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer le praticien
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement
                                    le praticien <strong>Dr. {practitioner.firstName} {practitioner.lastName}</strong> 
                                    et toutes ses données associées (planning, rendez-vous).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePractitioner(practitioner.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer définitivement
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil du praticien</DialogTitle>
            <DialogDescription>
              Informations détaillées du praticien
            </DialogDescription>
          </DialogHeader>
          {selectedPractitioner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="text-sm text-gray-600">
                    Dr. {selectedPractitioner.firstName} {selectedPractitioner.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Spécialité</Label>
                  <p className="text-sm text-gray-600">
                    {specialityLabels[selectedPractitioner.specialty as Speciality] || selectedPractitioner.specialty}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedPractitioner.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-gray-600">{selectedPractitioner.phoneNumber || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Durée des créneaux</Label>
                  <p className="text-sm text-gray-600">{selectedPractitioner.slotDuration || 30} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Couleur</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: selectedPractitioner.color }}
                    />
                    <span className="text-sm text-gray-600">{selectedPractitioner.color}</span>
                  </div>
                </div>
              </div>
              
              {selectedPractitioner.workingHours && selectedPractitioner.workingHours.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Horaires de travail</Label>
                  <div className="mt-2 space-y-2">
                    {selectedPractitioner.workingHours.map((workingDay, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        <span className="font-medium">
                          {dayLabels[workingDay.dayOfWeek as DayOfWeek]}:
                        </span>
                        {' '}
                        {workingDay.slots.map((slot, slotIndex) => (
                          <span key={slotIndex}>
                            {slot.start} - {slot.end}
                            {slotIndex < workingDay.slots.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setShowDetailModal(false);
              if (selectedPractitioner) {
                handleOpenEditModal(selectedPractitioner);
              }
            }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le praticien</DialogTitle>
            <DialogDescription>
              Modifier les informations du praticien {selectedPractitioner?.firstName} {selectedPractitioner?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedPractitioner && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdatePractitioner)} 
                className="space-y-6"
                id="edit-practitioner-form"
              >
                {/* Same form structure as create modal but with editForm */}
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="speciality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spécialité *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la spécialité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(specialityLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur *</FormLabel>
                          <FormControl>
                            <Input type="color" {...field} />
                          </FormControl>
                          <FormDescription>
                            Couleur pour identifier le praticien dans le planning
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+33123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="slotDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée des créneaux (minutes) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 30)}
                          />
                        </FormControl>
                        <FormDescription>
                          Durée par défaut des créneaux de rendez-vous (5-120 minutes)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Working Hours - Similar to create form but with editFields */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Horaires de travail</h3>
                    <p className="text-sm text-gray-500">Définissez les créneaux de disponibilité</p>
                  </div>

                  {editFields.map((field, dayIndex) => (
                    <div key={field.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <FormField
                          control={editForm.control}
                          name={`workingHours.${dayIndex}.dayOfWeek`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jour de la semaine</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(dayLabels).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editRemove(dayIndex)}
                          disabled={editFields.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Time Slots */}
                      <div className="space-y-2">
                        <Label>Créneaux horaires</Label>
                        {editForm.watch(`workingHours.${dayIndex}.slots`)?.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2">
                            <FormField
                              control={editForm.control}
                              name={`workingHours.${dayIndex}.slots.${slotIndex}.start`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <span>à</span>
                            <FormField
                              control={editForm.control}
                              name={`workingHours.${dayIndex}.slots.${slotIndex}.end`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeSlot(dayIndex, slotIndex, true)}
                              disabled={editForm.watch(`workingHours.${dayIndex}.slots`)?.length === 1}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(dayIndex, true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un créneau
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => editAppend({
                      dayOfWeek: DayOfWeek.MONDAY,
                      slots: [{ start: '09:00', end: '17:00' }],
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un jour
                  </Button>
                </div>
              </form>
            </Form>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdating}
            >
              Annuler
            </Button>
            <Button 
              form="edit-practitioner-form"
              type="submit"
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}