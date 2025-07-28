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
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  Download,
  Upload,
  Filter,
  User,
  TestTube,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import { 
  labResultsService, 
  LabResult, 
  CreateLabResultDto 
} from '@/services/lab-results-service';
import { encountersService, Encounter } from '@/services/encounters-service';
import { PatientService } from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';
import { downloadFile } from '@/lib/download-utils';

// Form validation schema
const labResultFormSchema = z.object({
  patientId: z.string().min(1, 'Le patient est requis'),
  encounterId: z.string().optional(),
  labName: z.string().min(1, 'Le nom du laboratoire est requis'),
  result: z.string().min(1, 'Les résultats sont requis'),
  filePath: z.string().optional(),
  receivedAt: z.string().min(1, 'La date de réception est requise'),
});

type LabResultFormData = z.infer<typeof labResultFormSchema>;

export default function LabResultsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLabResult, setSelectedLabResult] = useState<LabResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data for form options
  const [patients, setPatients] = useState<any[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);

  const form = useForm<LabResultFormData>({
    resolver: zodResolver(labResultFormSchema),
    defaultValues: {
      patientId: '',
      encounterId: 'none',
      labName: '',
      result: '',
      filePath: '',
      receivedAt: new Date().toISOString().slice(0, 16),
    },
  });

  const editForm = useForm<LabResultFormData>({
    resolver: zodResolver(labResultFormSchema),
    defaultValues: {
      patientId: '',
      encounterId: 'none',
      labName: '',
      result: '',
      filePath: '',
      receivedAt: '',
    },
  });

  // Load lab results from API
  const loadLabResults = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux résultats labo');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const response = await labResultsService.getLabResults();
      setLabResults(response);
    } catch (error: any) {
      console.error('Error loading lab results:', error);
      if (error.status === 401 || error.status === 403) {
        setError(`Erreur ${error.status}: ${error.message}`);
        toast.error(`Erreur d'authentification (${error.status})`);
        return;
      }
      setError('Erreur lors du chargement des résultats labo');
      toast.error('Erreur lors du chargement des résultats labo');
      setLabResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load form data (patients and encounters)
  const loadFormData = async () => {
    try {
      const [patientsData, encountersData] = await Promise.all([
        PatientService.getPatients({ limit: 1000 }),
        encountersService.getEncounters(),
      ]);
      
      setPatients(patientsData.data || []);
      setEncounters(encountersData);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadLabResults();
    loadFormData();
  }, []);

  // Get unique lab names for filter
  const uniqueLabNames = Array.from(new Set(labResults.map(lr => lr.labName)));

  // Filter lab results based on search and filters
  const filteredLabResults = labResults.filter((labResult) => {
    const matchesSearch = 
      labResult.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labResult.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labResult.patient?.mrn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labResult.labName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(labResult.result).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLab = labFilter === 'all' || labResult.labName === labFilter;
    
    return matchesSearch && matchesLab;
  });

  const handleCreateLabResult = async (data: LabResultFormData) => {
    try {
      setIsCreating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un résultat labo');
        router.push('/auth/login');
        return;
      }

      // Parse the result JSON
      let parsedResult: Record<string, any>;
      try {
        parsedResult = JSON.parse(data.result);
      } catch {
        // If not valid JSON, treat as a simple text result
        parsedResult = { result: data.result };
      }

      const labResultData: CreateLabResultDto = {
        patientId: data.patientId,
        encounterId: data.encounterId && data.encounterId !== 'none' ? data.encounterId : undefined,
        labName: data.labName,
        result: parsedResult,
        filePath: data.filePath || undefined,
        receivedAt: data.receivedAt,
      };

      await labResultsService.createLabResult(labResultData);
      await loadLabResults();
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Résultat labo créé avec succès');
    } catch (error: any) {
      console.error('Error creating lab result:', error);
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      toast.error('Erreur lors de la création du résultat labo');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateLabResult = async (data: LabResultFormData) => {
    if (!selectedLabResult) return;

    try {
      setIsUpdating(true);

      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour modifier un résultat labo');
        router.push('/auth/login');
        return;
      }

      // Parse the result JSON
      let parsedResult: Record<string, any>;
      try {
        parsedResult = JSON.parse(data.result);
      } catch {
        // If not valid JSON, treat as a simple text result
        parsedResult = { result: data.result };
      }

      const labResultData: Partial<CreateLabResultDto> = {
        patientId: data.patientId,
        encounterId: data.encounterId && data.encounterId !== 'none' ? data.encounterId : undefined,
        labName: data.labName,
        result: parsedResult,
        filePath: data.filePath || undefined,
        receivedAt: data.receivedAt,
      };

      await labResultsService.updateLabResult(selectedLabResult.id, labResultData);
      await loadLabResults();
      setIsEditModalOpen(false);
      toast.success('Résultat labo mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating lab result:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du résultat labo');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLabResult = async (labResultId: string) => {
    try {
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer un résultat labo');
        router.push('/auth/login');
        return;
      }

      await labResultsService.deleteLabResult(labResultId);
      await loadLabResults();
      toast.success('Résultat labo supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting lab result:', error);
      toast.error(error.message || 'Erreur lors de la suppression du résultat labo');
    }
  };

  const handleOpenEditModal = (labResult: LabResult) => {
    setSelectedLabResult(labResult);
    editForm.reset({
      patientId: labResult.patientId,
      encounterId: labResult.encounterId || 'none',
      labName: labResult.labName,
      result: JSON.stringify(labResult.result, null, 2),
      filePath: labResult.filePath || '',
      receivedAt: new Date(labResult.receivedAt).toISOString().slice(0, 16),
    });
    setIsEditModalOpen(true);
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const formatResult = (result: Record<string, any>): string => {
    if (typeof result === 'string') return result;
    if (result.result) return result.result;
    
    // Format as key-value pairs
    return Object.entries(result)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  // Get result status based on values
  const getResultStatus = (result: Record<string, any>) => {
    const resultStr = JSON.stringify(result).toLowerCase();
    if (resultStr.includes('normal') || resultStr.includes('négatif')) {
      return { status: 'normal', color: 'default' };
    }
    if (resultStr.includes('anormal') || resultStr.includes('positif') || resultStr.includes('élevé')) {
      return { status: 'anormal', color: 'destructive' };
    }
    return { status: 'à analyser', color: 'secondary' };
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
          <h1 className="text-3xl font-bold text-gray-900">Résultats de laboratoire</h1>
          <p className="text-gray-600 mt-1">
            Gérez les résultats d&apos;analyses et examens de laboratoire
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadLabResults} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau résultat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau résultat de laboratoire</DialogTitle>
                <DialogDescription>
                  Enregistrez un nouveau résultat d&apos;analyse de laboratoire.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateLabResult)} className="space-y-6">
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
                      name="encounterId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation (optionnel)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Associer à une consultation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Aucune consultation</SelectItem>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="labName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du laboratoire *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Laboratoire Central, BioLab..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="receivedAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de réception *</FormLabel>
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
                    name="result"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Résultats *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder='Saisissez les résultats (format JSON accepté):
Ex: {"hémoglobine": "12.5 g/dL", "globules blancs": "7200/μL", "statut": "normal"}'
                            className="min-h-[120px] font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Vous pouvez saisir du texte simple ou du JSON pour des résultats structurés
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="filePath"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chemin du fichier (optionnel)</FormLabel>
                        <FormControl>
                          <Input placeholder="/uploads/lab-results/..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Chemin vers le fichier PDF ou image du résultat
                        </FormDescription>
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
                      Créer le résultat
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
            <CardTitle className="text-sm font-medium">Total Résultats</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{labResults.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredLabResults.length} affiché(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résultats normaux</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {labResults.filter(lr => getResultStatus(lr.result).status === 'normal').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Dans les normes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résultats anormaux</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {labResults.filter(lr => getResultStatus(lr.result).status === 'anormal').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laboratoires</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uniqueLabNames.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Laboratoires différents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Résultats de Laboratoire</CardTitle>
          <CardDescription>
            Recherchez et filtrez les résultats d&apos;analyses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par patient, laboratoire ou résultat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={labFilter} onValueChange={setLabFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Laboratoire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les laboratoires</SelectItem>
                  {uniqueLabNames.map((labName) => (
                    <SelectItem key={labName} value={labName}>
                      {labName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setLabFilter('all');
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
              <Button variant="outline" size="sm" onClick={loadLabResults}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Lab Results Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Laboratoire</TableHead>
                  <TableHead>Résultats</TableHead>
                  <TableHead>Date réception</TableHead>
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
                        <p className="text-gray-500">Chargement des résultats labo...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLabResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <TestTube className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun résultat trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLabResults.map((labResult) => {
                    const status = getResultStatus(labResult.result);
                    return (
                      <TableRow key={labResult.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {labResult.patient?.firstName} {labResult.patient?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              MRN: {labResult.patient?.mrn}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {labResult.labName}
                          </div>
                          {labResult.encounter && (
                            <div className="text-sm text-gray-500">
                              Lié à: {labResult.encounter.motive}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-sm">
                            {formatResult(labResult.result)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDateTime(labResult.receivedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant={status.color as any}>
                              {status.status}
                            </Badge>
                            {labResult.filePath && (
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                Fichier
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
                              <DropdownMenuLabel>Actions du résultat</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedLabResult(labResult);
                                  setShowDetailModal(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le détail complet
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem
                                onClick={() => handleOpenEditModal(labResult)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier le résultat
                              </DropdownMenuItem>
                              
                              {labResult.filePath && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Download file
                                    downloadFile(labResult.filePath!, `lab-result-${labResult.id}.pdf`);
                                  }}
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Télécharger fichier
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
                                    Supprimer le résultat
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action ne peut pas être annulée. Cela supprimera définitivement
                                      le résultat de laboratoire pour {labResult.patient?.firstName} {labResult.patient?.lastName}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteLabResult(labResult.id)}
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du résultat de laboratoire</DialogTitle>
            <DialogDescription>
              Informations complètes du résultat d&apos;analyse
            </DialogDescription>
          </DialogHeader>
          {selectedLabResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Patient</Label>
                    <p className="text-sm text-gray-600">
                      {selectedLabResult.patient?.firstName} {selectedLabResult.patient?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">MRN: {selectedLabResult.patient?.mrn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Laboratoire</Label>
                    <p className="text-sm text-gray-600">{selectedLabResult.labName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date de réception</Label>
                    <p className="text-sm text-gray-600">{formatDateTime(selectedLabResult.receivedAt)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedLabResult.encounter && (
                    <div>
                      <Label className="text-sm font-medium">Consultation associée</Label>
                      <p className="text-sm text-gray-600">{selectedLabResult.encounter.motive}</p>
                      <p className="text-xs text-gray-500">{formatDateTime(selectedLabResult.encounter.startAt)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium">Statut du résultat</Label>
                    <Badge variant={getResultStatus(selectedLabResult.result).color as any} className="ml-2">
                      {getResultStatus(selectedLabResult.result).status}
                    </Badge>
                  </div>
                  {selectedLabResult.filePath && (
                    <div>
                      <Label className="text-sm font-medium">Fichier attaché</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="h-4 w-4" />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            downloadFile(selectedLabResult.filePath!, `lab-result-${selectedLabResult.id}.pdf`);
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Résultats détaillés</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {JSON.stringify(selectedLabResult.result, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setShowDetailModal(false);
              if (selectedLabResult) {
                handleOpenEditModal(selectedLabResult);
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
            <DialogTitle>Modifier le résultat de laboratoire</DialogTitle>
            <DialogDescription>
              Modifiez les informations du résultat d&apos;analyse
            </DialogDescription>
          </DialogHeader>
          {selectedLabResult && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdateLabResult)} 
                className="space-y-6"
                id="edit-lab-result-form"
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
                    name="encounterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation (optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Associer à une consultation" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Aucune consultation</SelectItem>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="labName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du laboratoire *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Laboratoire Central, BioLab..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="receivedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de réception *</FormLabel>
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
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Résultats *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Résultats de l'analyse..."
                          className="min-h-[120px] font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="filePath"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chemin du fichier (optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="/uploads/lab-results/..." {...field} />
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
              form="edit-lab-result-form"
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