'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  ClipboardList,
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
  Download,
  QrCode,
  FileText,
  Filter,
  User,
  Stethoscope,
} from 'lucide-react';
import { 
  prescriptionsService, 
  Prescription, 
  CreatePrescriptionDto,
  PrescriptionItem
} from '@/services/prescriptions-service';
import { encountersService, Encounter } from '@/services/encounters-service';
import { practitionersService, Practitioner } from '@/services/practitioners-service';
import { useAuth } from '@/hooks/useAuth';
import { downloadFromApi } from '@/lib/download-utils';
import { AuthenticatedImage } from '@/components/ui/authenticated-image';
import { tokenManager } from '@/lib/api';

// Form validation schema
const prescriptionItemSchema = z.object({
  medication: z.string().min(1, 'Le médicament est requis'),
  dosage: z.string().min(1, 'La posologie est requise'),
  frequency: z.string().min(1, 'La fréquence est requise'),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

const prescriptionFormSchema = z.object({
  encounterId: z.string().min(1, 'La consultation est requise'),
  practitionerId: z.string().min(1, 'Le praticien est requis'),
  expiresAt: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'Au moins un médicament est requis'),
});

type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

export default function PrescriptionsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data for form options
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      encounterId: '',
      practitionerId: '',
      expiresAt: '',
      items: [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    },
  });

  const editForm = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      encounterId: '',
      practitionerId: '',
      expiresAt: '',
      items: [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    },
  });

  // Load prescriptions from API
  const loadPrescriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux prescriptions');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const response = await prescriptionsService.getPrescriptions();
      setPrescriptions(response);
    } catch (error: any) {
      console.error('Error loading prescriptions:', error);
      if (error.status === 401 || error.status === 403) {
        setError(`Erreur ${error.status}: ${error.message}`);
        toast.error(`Erreur d'authentification (${error.status})`);
        return;
      }
      setError('Erreur lors du chargement des prescriptions');
      toast.error('Erreur lors du chargement des prescriptions');
      setPrescriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load form data (encounters and practitioners)
  const loadFormData = async () => {
    try {
      const [encountersData, practitionersData] = await Promise.all([
        encountersService.getEncounters(),
        practitionersService.getPractitioners(),
      ]);
      
      setEncounters(encountersData);
      setPractitioners(practitionersData);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPrescriptions();
    loadFormData();
  }, []);

  // Filter prescriptions based on search and filters
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = 
      prescription.encounter?.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.encounter?.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.encounter?.patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.practitioner?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.practitioner?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.encounter?.motive?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && (!prescription.expiresAt || new Date(prescription.expiresAt) > now)) ||
      (statusFilter === 'expired' && prescription.expiresAt && new Date(prescription.expiresAt) <= now);
    
    return matchesSearch && matchesStatus;
  });

  const generatePdfPath = (encounterId: string, practitionerId: string): string => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `/uploads/prescriptions/${encounterId}/${practitionerId}-${timestamp}.pdf`;
  };

  const handleCreatePrescription = async (data: PrescriptionFormData) => {
    try {
      setIsCreating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer une prescription');
        router.push('/auth/login');
        return;
      }

      const prescriptionData: CreatePrescriptionDto = {
        encounterId: data.encounterId,
        practitionerId: data.practitionerId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        items: data.items,
      };

      const createdPrescription = await prescriptionsService.createPrescription(prescriptionData);
      
      await loadPrescriptions();
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Prescription créée avec succès');
    } catch (error: any) {
      console.error('Error creating prescription:', error);
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      toast.error('Erreur lors de la création de la prescription');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePrescription = async (data: PrescriptionFormData) => {
    if (!selectedPrescription) return;

    try {
      setIsUpdating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour modifier une prescription');
        router.push('/auth/login');
        return;
      }

      const prescriptionData: Partial<CreatePrescriptionDto> = {
        encounterId: data.encounterId,
        practitionerId: data.practitionerId,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        items: data.items,
      };

      await prescriptionsService.updatePrescription(selectedPrescription.id, prescriptionData);
      await loadPrescriptions();
      setIsEditModalOpen(false);
      toast.success('Prescription mise à jour avec succès');
    } catch (error: any) {
      console.error('Error updating prescription:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour de la prescription');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer une prescription');
        router.push('/auth/login');
        return;
      }

      await prescriptionsService.deletePrescription(prescriptionId);
      await loadPrescriptions();
      toast.success('Prescription supprimée avec succès');
    } catch (error: any) {
      console.error('Error deleting prescription:', error);
      toast.error(error.message || 'Erreur lors de la suppression de la prescription');
    }
  };

  const handleOpenEditModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    editForm.reset({
      encounterId: prescription.encounterId,
      practitionerId: prescription.practitionerId,
      expiresAt: prescription.expiresAt ? new Date(prescription.expiresAt).toISOString().slice(0, 16) : '',
      items: prescription.items && prescription.items.length > 0 
        ? prescription.items 
        : [{ medication: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    });
    setIsEditModalOpen(true);
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const isExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
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
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-600 mt-1">
            Gérez les prescriptions médicales et ordonnances
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadPrescriptions} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle prescription</DialogTitle>
                <DialogDescription>
                  Créez une prescription pour une consultation existante.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePrescription)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="encounterId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une consultation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {encounters.map((encounter) => (
                                <SelectItem key={encounter.id} value={encounter.id}>
                                  {encounter.patient?.firstName} {encounter.patient?.lastName} - {encounter.motive} ({formatDateTime(encounter.startAt)})
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

                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d&apos;expiration</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormDescription>
                          Laissez vide si la prescription n&apos;expire pas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Section des médicaments */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Médicaments prescrits</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentItems = form.getValues('items');
                          form.setValue('items', [...currentItems, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un médicament
                      </Button>
                    </div>
                    
                    {form.watch('items').map((_, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-medium">Médicament {index + 1}</h5>
                          {form.watch('items').length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentItems = form.getValues('items');
                                const newItems = currentItems.filter((_, i) => i !== index);
                                form.setValue('items', newItems);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.medication`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Médicament *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom du médicament" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.dosage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Posologie *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: 500mg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fréquence *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: 3 fois par jour" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Durée</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: 7 jours" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name={`items.${index}.instructions`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions</FormLabel>
                              <FormControl>
                                <Input placeholder="Instructions spéciales..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
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
                      Créer la prescription
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
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPrescriptions.length} affiché(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions actives</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter(p => !isExpired(p.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Non expirées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions expirées</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter(p => isExpired(p.expiresAt)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              À renouveler
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avec QR Code</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prescriptions.filter(p => p.qr).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Validation électronique
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Prescriptions</CardTitle>
          <CardDescription>
            Recherchez et filtrez les prescriptions médicales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par patient, praticien ou motif..."
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
                  <SelectItem value="all">Toutes les prescriptions</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="expired">Expirées</SelectItem>
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
              <Button variant="outline" size="sm" onClick={loadPrescriptions}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Prescriptions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Consultation</TableHead>
                  <TableHead>Praticien</TableHead>
                  <TableHead>Date prescription</TableHead>
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
                        <p className="text-gray-500">Chargement des prescriptions...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPrescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucune prescription trouvée</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {prescription.encounter?.patient?.firstName} {prescription.encounter?.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            MRN: {prescription.encounter?.patient?.mrn}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {prescription.encounter?.motive}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(prescription.encounter?.startAt || '')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            Dr. {prescription.practitioner?.firstName} {prescription.practitioner?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {prescription.practitioner?.specialty}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(prescription.encounter?.startAt || '')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={isExpired(prescription.expiresAt) ? "destructive" : "default"}>
                            {isExpired(prescription.expiresAt) ? 'Expirée' : 'Active'}
                          </Badge>
                          {prescription.qr && (
                            <Badge variant="outline" className="text-xs">
                              <QrCode className="h-3 w-3 mr-1" />
                              QR Code
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions de la prescription</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPrescription(prescription);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le détail complet
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(prescription)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier la prescription
                            </DropdownMenuItem>
                            
                            {prescription.pdfPath && (
                              <DropdownMenuItem
                                onClick={async () => {
                                  try {
                                    await downloadFromApi(
                                      `${process.env.NEXT_PUBLIC_API_URL}/prescriptions/${prescription.id}/download/pdf`,
                                      `prescription-${prescription.id}.pdf`
                                    );
                                  } catch (error) {
                                    toast.error('Erreur lors du téléchargement du PDF');
                                  }
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger PDF
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer la prescription
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement
                                    la prescription pour {prescription.encounter?.patient?.firstName} {prescription.encounter?.patient?.lastName}.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePrescription(prescription.id)}
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
            <DialogTitle>Détails de la prescription</DialogTitle>
            <DialogDescription>
              Informations complètes de la prescription
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Patient</Label>
                  <p className="text-sm text-gray-600">
                    {selectedPrescription.encounter?.patient?.firstName} {selectedPrescription.encounter?.patient?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">MRN: {selectedPrescription.encounter?.patient?.mrn}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Praticien</Label>
                  <p className="text-sm text-gray-600">
                    Dr. {selectedPrescription.practitioner?.firstName} {selectedPrescription.practitioner?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedPrescription.practitioner?.specialty}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Consultation associée</Label>
                <p className="text-sm text-gray-600">{selectedPrescription.encounter?.motive}</p>
                <p className="text-xs text-gray-500">{formatDateTime(selectedPrescription.encounter?.startAt || '')}</p>
              </div>
              
              {selectedPrescription.expiresAt && (
                <div>
                  <Label className="text-sm font-medium">Date d&apos;expiration</Label>
                  <p className="text-sm text-gray-600">{formatDateTime(selectedPrescription.expiresAt)}</p>
                  <Badge variant={isExpired(selectedPrescription.expiresAt) ? "destructive" : "default"} className="mt-1">
                    {isExpired(selectedPrescription.expiresAt) ? 'Expirée' : 'Active'}
                  </Badge>
                </div>
              )}
              
              {/* Section des médicaments prescrits */}
              {selectedPrescription.items && selectedPrescription.items.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Médicaments prescrits</Label>
                  <div className="mt-2 space-y-3">
                    {selectedPrescription.items.map((item, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Médicament</Label>
                            <p className="text-sm font-medium">{item.medication}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Posologie</Label>
                            <p className="text-sm">{item.dosage}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <Label className="text-xs font-medium text-gray-500">Fréquence</Label>
                            <p className="text-sm">{item.frequency}</p>
                          </div>
                          {item.duration && (
                            <div>
                              <Label className="text-xs font-medium text-gray-500">Durée</Label>
                              <p className="text-sm">{item.duration}</p>
                            </div>
                          )}
                        </div>
                        {item.instructions && (
                          <div className="mt-2">
                            <Label className="text-xs font-medium text-gray-500">Instructions</Label>
                            <p className="text-sm">{item.instructions}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPrescription.qr && (
                <div>
                  <Label className="text-sm font-medium">Code QR</Label>
                  <div className="mt-2 flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <AuthenticatedImage
                        src={`${process.env.NEXT_PUBLIC_API_URL}/prescriptions/${selectedPrescription.id}/qr-image`}
                        alt="QR Code de la prescription"
                        className="w-32 h-32 border rounded-md"
                        fallback={
                          <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-gray-50">
                            <QrCode className="h-8 w-8 text-gray-400" />
                          </div>
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-2">Chemin de stockage:</p>
                      <p className="text-xs text-gray-600 font-mono break-all">{selectedPrescription.qr}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={async () => {
                          try {
                            await downloadFromApi(
                              `${process.env.NEXT_PUBLIC_API_URL}/prescriptions/${selectedPrescription.id}/download/qr`,
                              `prescription-qr-${selectedPrescription.id}.png`
                            );
                          } catch (error) {
                            toast.error('Erreur lors du téléchargement du QR code');
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger QR
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedPrescription.pdfPath && (
                <div>
                  <Label className="text-sm font-medium">Fichier PDF</Label>
                  <p className="text-sm text-gray-600 break-all">{selectedPrescription.pdfPath}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={async () => {
                      try {
                        await downloadFromApi(
                          `${process.env.NEXT_PUBLIC_API_URL}/prescriptions/${selectedPrescription.id}/download/pdf`,
                          `prescription-${selectedPrescription.id}.pdf`
                        );
                      } catch (error) {
                        toast.error('Erreur lors du téléchargement du PDF');
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
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
              if (selectedPrescription) {
                handleOpenEditModal(selectedPrescription);
              }
            }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la prescription</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la prescription
            </DialogDescription>
          </DialogHeader>
          {selectedPrescription && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdatePrescription)} 
                className="space-y-6"
                id="edit-prescription-form"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="encounterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une consultation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {encounters.map((encounter) => (
                              <SelectItem key={encounter.id} value={encounter.id}>
                                {encounter.patient?.firstName} {encounter.patient?.lastName} - {encounter.motive}
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

                <FormField
                  control={editForm.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d&apos;expiration</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormDescription>
                        Laissez vide si la prescription n&apos;expire pas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Section des médicaments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Médicaments prescrits</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentItems = editForm.getValues('items');
                        editForm.setValue('items', [...currentItems, { medication: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un médicament
                    </Button>
                  </div>
                  
                  {editForm.watch('items').map((_, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Médicament {index + 1}</h5>
                        {editForm.watch('items').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentItems = editForm.getValues('items');
                              const newItems = currentItems.filter((_, i) => i !== index);
                              editForm.setValue('items', newItems);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name={`items.${index}.medication`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Médicament *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom du médicament" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name={`items.${index}.dosage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Posologie *</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 500mg" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name={`items.${index}.frequency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fréquence *</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 3 fois par jour" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name={`items.${index}.duration`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Durée</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: 7 jours" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={editForm.control}
                        name={`items.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructions</FormLabel>
                            <FormControl>
                              <Input placeholder="Instructions spéciales..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
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
              form="edit-prescription-form"
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