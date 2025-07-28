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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Lock,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Stethoscope,
  Clock,
  Filter,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { 
  encountersService, 
  Encounter, 
  CreateEncounterDto, 
  UpdateEncounterDto 
} from '@/services/encounters-service';
import { practitionersService, Practitioner } from '@/services/practitioners-service';
import { PatientService } from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const encounterFormSchema = z.object({
  patientId: z.string().min(1, 'Le patient est requis'),
  practitionerId: z.string().min(1, 'Le praticien est requis'),
  startAt: z.string().min(1, 'La date/heure de début est requise'),
  endAt: z.string().optional(),
  motive: z.string().min(1, 'Le motif de consultation est requis'),
  exam: z.string().optional(),
  diagnosis: z.string().optional(),
  icd10Codes: z.array(z.string()).optional(),
});

type EncounterFormData = z.infer<typeof encounterFormSchema>;

export default function EncountersPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data for form options
  const [patients, setPatients] = useState<any[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

  const form = useForm<EncounterFormData>({
    resolver: zodResolver(encounterFormSchema),
    defaultValues: {
      patientId: '',
      practitionerId: '',
      startAt: new Date().toISOString().slice(0, 16),
      endAt: '',
      motive: '',
      exam: '',
      diagnosis: '',
      icd10Codes: [],
    },
  });

  const editForm = useForm<EncounterFormData>({
    resolver: zodResolver(encounterFormSchema),
    defaultValues: {
      patientId: '',
      practitionerId: '',
      startAt: '',
      endAt: '',
      motive: '',
      exam: '',
      diagnosis: '',
      icd10Codes: [],
    },
  });

  // Load encounters from API
  const loadEncounters = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux consultations');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const response = await encountersService.getEncounters();
      setEncounters(response);
    } catch (error: any) {
      console.error('Error loading encounters:', error);
      if (error.status === 401 || error.status === 403) {
        setError(`Erreur ${error.status}: ${error.message}`);
        toast.error(`Erreur d'authentification (${error.status})`);
        return;
      }
      setError('Erreur lors du chargement des consultations');
      toast.error('Erreur lors du chargement des consultations');
      setEncounters([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load form data (patients and practitioners)
  const loadFormData = async () => {
    try {
      const [patientsData, practitionersData] = await Promise.all([
        PatientService.getPatients({ limit: 1000 }),
        practitionersService.getPractitioners(),
      ]);
      
      setPatients(patientsData.data || []);
      setPractitioners(practitionersData);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadEncounters();
    loadFormData();
  }, []);

  // Filter encounters based on search and filters
  const filteredEncounters = encounters.filter((encounter) => {
    const matchesSearch = 
      encounter.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.motive?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'locked' && encounter.locked) ||
      (statusFilter === 'unlocked' && !encounter.locked);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateEncounter = async (data: EncounterFormData) => {
    try {
      setIsCreating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer une consultation');
        router.push('/auth/login');
        return;
      }

      const encounterData: CreateEncounterDto = {
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        startAt: data.startAt,
        endAt: data.endAt || undefined,
        motive: data.motive,
        exam: data.exam || undefined,
        diagnosis: data.diagnosis || undefined,
        icd10Codes: data.icd10Codes?.filter(code => code.trim() !== '') || undefined,
      };

      await encountersService.createEncounter(encounterData);
      await loadEncounters();
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Consultation créée avec succès');
    } catch (error: any) {
      console.error('Error creating encounter:', error);
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      toast.error('Erreur lors de la création de la consultation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateEncounter = async (data: EncounterFormData) => {
    if (!selectedEncounter) return;

    try {
      setIsUpdating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour modifier une consultation');
        router.push('/auth/login');
        return;
      }

      const encounterData: UpdateEncounterDto = {
        id: selectedEncounter.id,
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        startAt: data.startAt,
        endAt: data.endAt || undefined,
        motive: data.motive,
        exam: data.exam || undefined,
        diagnosis: data.diagnosis || undefined,
        icd10Codes: data.icd10Codes?.filter(code => code.trim() !== '') || undefined,
      };

      await encountersService.updateEncounter(encounterData);
      await loadEncounters();
      setIsEditModalOpen(false);
      toast.success('Consultation mise à jour avec succès');
    } catch (error: any) {
      console.error('Error updating encounter:', error);
      toast.error('Erreur lors de la mise à jour de la consultation');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLockEncounter = async (encounterId: string) => {
    try {
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour verrouiller une consultation');
        router.push('/auth/login');
        return;
      }

      await encountersService.lockEncounter({ id: encounterId });
      await loadEncounters();
      toast.success('Consultation verrouillée avec succès');
    } catch (error: any) {
      console.error('Error locking encounter:', error);
      toast.error('Erreur lors du verrouillage de la consultation');
    }
  };

  const handleOpenEditModal = (encounter: Encounter) => {
    setSelectedEncounter(encounter);
    editForm.reset({
      patientId: encounter.patientId,
      practitionerId: encounter.practitionerId,
      startAt: new Date(encounter.startAt).toISOString().slice(0, 16),
      endAt: encounter.endAt ? new Date(encounter.endAt).toISOString().slice(0, 16) : '',
      motive: encounter.motive,
      exam: encounter.exam || '',
      diagnosis: encounter.diagnosis || '',
      icd10Codes: encounter.icd10Codes || [],
    });
    setIsEditModalOpen(true);
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR');
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
          <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-600 mt-1">
            Gérez les consultations et dossiers médicaux
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadEncounters} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle consultation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle consultation</DialogTitle>
                <DialogDescription>
                  Enregistrez une nouvelle consultation médicale.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateEncounter)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un praticien" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {practitioners.map((practitioner) => (
                                <SelectItem key={practitioner.id} value={practitioner.id}>
                                  Dr. {practitioner.firstName} {practitioner.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date/Heure de début *</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date/Heure de fin</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="motive"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motif de consultation *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Douleur abdominale, contrôle..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Examen clinique</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Description de l'examen physique..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnostic</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Diagnostic médical..."
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      Créer la consultation
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encounters.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEncounters.length} affiché(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations verrouillées</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {encounters.filter(e => e.locked).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Dossiers finalisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd&apos;hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {encounters.filter(e => 
                new Date(e.startAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Consultations du jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {encounters.filter(e => !e.endAt && !e.locked).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Consultations ouvertes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Consultations</CardTitle>
          <CardDescription>
            Recherchez et filtrez les consultations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par patient, motif ou diagnostic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les consultations</SelectItem>
                  <SelectItem value="locked">Verrouillées</SelectItem>
                  <SelectItem value="unlocked">Non verrouillées</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
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
              <Button variant="outline" size="sm" onClick={loadEncounters}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Encounters Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Praticien</TableHead>
                  <TableHead>Date/Heure</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des consultations...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEncounters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucune consultation trouvée</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEncounters.map((encounter) => (
                    <TableRow key={encounter.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {encounter.patient?.firstName} {encounter.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            MRN: {encounter.patient?.mrn}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Dr. {encounter.practitioner?.firstName} {encounter.practitioner?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {encounter.practitioner?.specialty}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatDateTime(encounter.startAt)}
                          </div>
                          {encounter.endAt && (
                            <div className="text-sm text-gray-500">
                              Fin: {formatDateTime(encounter.endAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">
                          {encounter.motive}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={encounter.locked ? "default" : "secondary"}>
                          {encounter.locked ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Verrouillée
                            </>
                          ) : (
                            <>
                              <Edit className="h-3 w-3 mr-1" />
                              Modifiable
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions de la consultation</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEncounter(encounter);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le détail complet
                            </DropdownMenuItem>
                            
                            {!encounter.locked && (
                              <DropdownMenuItem
                                onClick={() => handleOpenEditModal(encounter)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier la consultation
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {!encounter.locked && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Verrouiller la consultation
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Verrouiller la consultation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action verrouillera définitivement la consultation. 
                                      Une fois verrouillée, elle ne pourra plus être modifiée. 
                                      Êtes-vous sûr de vouloir continuer ?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleLockEncounter(encounter.id)}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      Verrouiller
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la consultation</DialogTitle>
            <DialogDescription>
              Informations complètes de la consultation
            </DialogDescription>
          </DialogHeader>
          {selectedEncounter && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Patient</Label>
                    <p className="text-sm text-gray-600">
                      {selectedEncounter.patient?.firstName} {selectedEncounter.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">MRN: {selectedEncounter.patient?.mrn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Praticien</Label>
                    <p className="text-sm text-gray-600">
                      Dr. {selectedEncounter.practitioner?.firstName} {selectedEncounter.practitioner?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{selectedEncounter.practitioner?.specialty}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Date/Heure de début</Label>
                    <p className="text-sm text-gray-600">{formatDateTime(selectedEncounter.startAt)}</p>
                  </div>
                  {selectedEncounter.endAt && (
                    <div>
                      <Label className="text-sm font-medium">Date/Heure de fin</Label>
                      <p className="text-sm text-gray-600">{formatDateTime(selectedEncounter.endAt)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Statut</Label>
                    <Badge variant={selectedEncounter.locked ? "default" : "secondary"} className="ml-2">
                      {selectedEncounter.locked ? 'Verrouillée' : 'Modifiable'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Motif de consultation</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedEncounter.motive}</p>
                </div>
                
                {selectedEncounter.exam && (
                  <div>
                    <Label className="text-sm font-medium">Examen clinique</Label>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{selectedEncounter.exam}</p>
                  </div>
                )}
                
                {selectedEncounter.diagnosis && (
                  <div>
                    <Label className="text-sm font-medium">Diagnostic</Label>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{selectedEncounter.diagnosis}</p>
                  </div>
                )}
                
                {selectedEncounter.icd10Codes && selectedEncounter.icd10Codes.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Codes ICD-10</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEncounter.icd10Codes.map((code, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            {selectedEncounter && !selectedEncounter.locked && (
              <Button onClick={() => {
                setShowDetailModal(false);
                handleOpenEditModal(selectedEncounter);
              }}>
                Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la consultation</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la consultation
            </DialogDescription>
          </DialogHeader>
          {selectedEncounter && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdateEncounter)} 
                className="space-y-6"
                id="edit-encounter-form"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
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
                                Dr. {practitioner.firstName} {practitioner.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="startAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date/Heure de début *</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="endAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date/Heure de fin</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="motive"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif de consultation *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Douleur abdominale, contrôle..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="exam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Examen clinique</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description de l'examen physique..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnostic</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Diagnostic médical..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              form="edit-encounter-form"
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