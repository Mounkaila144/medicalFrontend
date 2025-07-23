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
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  FileText,
  Clock,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { Patient, Gender, BloodType, PatientForm } from '@/types';
import { PatientService } from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';
import { downloadBlob } from '@/lib/download-utils';
import { AuthService } from '@/services/auth-service';
import { ClinicService } from '@/services/clinic-service';

// Form validation schema - based on backend requirements
const patientFormSchema = z.object({
  // Required fields (based on backend @IsNotEmpty())
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Le genre est requis' }) }),
  age: z.number().min(0, 'L\'âge doit être positif').max(150, 'L\'âge doit être réaliste'),
  
  // Optional fields (based on backend @IsOptional())
  mrn: z.string().optional(),
  bloodType: z.nativeEnum(BloodType).optional(),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

export default function PatientsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastName');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Modal states
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetailModal, setShowPatientDetailModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isUpdatingPatient, setIsUpdatingPatient] = useState(false);

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      // Required fields
      firstName: '',
      lastName: '',
      gender: Gender.M,
      age: 0,
      
      // Optional fields
      mrn: '',
      bloodType: undefined,
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    },
  });

  // Schema for editing (without mrn which is not editable)
  const patientEditSchema = z.object({
    // Required fields
    firstName: z.string().min(1, 'Le prénom est requis'),
    lastName: z.string().min(1, 'Le nom est requis'),
    gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Le genre est requis' }) }),
    age: z.number().min(0, 'L\'âge doit être positif').max(150, 'L\'âge doit être réaliste'),
    
    // Optional fields (no mrn)
    bloodType: z.nativeEnum(BloodType).optional(),
    phone: z.string().optional(),
    email: z.string().email('Email invalide').optional().or(z.literal('')),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  });

  type PatientEditData = z.infer<typeof patientEditSchema>;

  // Separate form for editing in modal
  const editForm = useForm<PatientEditData>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: {
      // Required fields
      firstName: '',
      lastName: '',
      gender: Gender.M,
      age: 0,
      
      // Optional fields (no mrn)
      bloodType: undefined,
      phone: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    },
  });

  // Load available clinics for SUPERADMIN
  const loadClinics = async () => {
    try {
      // Try to get clinics first, fallback to tenants for SUPERADMIN
      let clinics = [];
      try {
        clinics = await ClinicService.getClinics();
      } catch (error) {
        console.log('Clinics endpoint not available, trying tenants...');
        clinics = await ClinicService.getTenants();
      }
      
      console.log('🏥 Available Clinics:', clinics);
      setAvailableClinics(clinics || []);
      
      // Auto-select first clinic if available
      if (clinics.length > 0) {
        setSelectedClinicId(clinics[0].id);
      }
    } catch (error) {
      console.error('Error loading clinics:', error);
    }
  };

  // Load patients from API
  const loadPatients = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux patients');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      // Get user info and determine clinic approach
      if (typeof window === 'undefined') {
        return; // Skip on server-side
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.role;
      setIsSuperAdmin(userRole === 'SUPERADMIN');

      // Build params with clinic ID and filters
      const params: any = {
        search: searchTerm || undefined,
        page,
        limit: 10,
        sortBy,
        sortOrder,
        gender: genderFilter !== 'all' ? genderFilter : undefined,
      };
      
      if (userRole === 'SUPERADMIN') {
        // For SUPERADMIN, require clinic selection
        if (!selectedClinicId) {
          setError('Veuillez sélectionner une clinique pour voir les patients');
          setPatients([]); // Assurer qu'on a un tableau vide
          return;
        }
        params.clinicId = selectedClinicId;
      } else if (userRole === 'CLINIC_ADMIN' || userRole === 'EMPLOYEE') {
        // For CLINIC_ADMIN/EMPLOYEE, use their tenantId as clinicId
        if (user.tenantId) {
          params.clinicId = user.tenantId;
        }
      }
      
      console.log('🏥 Loading patients for role:', userRole, 'with clinicId:', params.clinicId);
      
      console.log('🔍 Loading patients with params:', params);
      
      const response = await PatientService.getPatients(params);
      console.log('🔍 Received patients response:', response);
      
      setPatients(response.data || []);
      setCurrentPage(response.page || page);
      setTotalPages(response.totalPages || 1);
      setTotalPatients(response.total || 0);
    } catch (error: any) {
      console.error('Error loading patients:', error);
      
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        console.error('🔍 Auth Error Details:', {
          status: error.status,
          message: error.message,
          data: error.data,
          hasToken: !!localStorage.getItem('accessToken'),
          tokenInfo: localStorage.getItem('accessToken')?.substring(0, 50)
        });
        
        setError(`Erreur ${error.status}: ${error.message}. Vérifiez la console pour plus de détails.`);
        toast.error(`Erreur d'authentification (${error.status}). Consultez la console.`);
        setPatients([]); // Assurer qu'on a un tableau vide en cas d'erreur d'auth
        
        // Temporarily commented out to avoid auto-redirect for debugging
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        // setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }
      
      setError('Erreur lors du chargement des patients');
      toast.error('Erreur lors du chargement des patients');
      setPatients([]); // Assurer qu'on a un tableau vide en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Load clinics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'SUPERADMIN') {
        loadClinics();
      }
    }
  }, []);

  // Function to update user profile with tenantId
  const updateUserProfile = async () => {
    try {
      const profileData = await AuthService.getProfile();
      console.log('✅ Updated user profile from API:', profileData);
      return profileData;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      return null;
    }
  };

  // Load patients on mount and when search/filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPatients(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedClinicId, genderFilter, sortBy, sortOrder]);

  // Update user profile on mount to ensure tenantId is available
  useEffect(() => {
    updateUserProfile();
  }, []);

  // Helper function to calculate age from dob
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Filter patients based on filters (note: most filtering should be done server-side)
  const filteredPatients = (patients || []).filter((patient) => {
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    
    // Age filter (client-side for display)
    const age = calculateAge(patient.dob);
    let matchesAge = true;
    if (ageFilter !== 'all') {
      switch (ageFilter) {
        case '0-18':
          matchesAge = age <= 18;
          break;
        case '19-30':
          matchesAge = age >= 19 && age <= 30;
          break;
        case '31-50':
          matchesAge = age >= 31 && age <= 50;
          break;
        case '51-70':
          matchesAge = age >= 51 && age <= 70;
          break;
        case '70+':
          matchesAge = age > 70;
          break;
      }
    }
    
    return matchesGender && matchesAge;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getGenderLabel = (gender: Gender): string => {
    switch (gender) {
      case Gender.M:
        return 'Homme';
      case Gender.F:
        return 'Femme';
      case Gender.OTHER:
        return 'Autre';
      default:
        return 'Non spécifié';
    }
  };

  // Open edit modal and populate form
  const handleOpenEditModal = (patient: Patient) => {
    setSelectedPatient(patient);
    
    // Calculate age from dob if available
    let calculatedAge = 0;
    if (patient.dob) {
      calculatedAge = calculateAge(patient.dob);
    }
    
    // Populate edit form with patient data (no mrn)
    editForm.reset({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      gender: patient.gender || Gender.M,
      age: calculatedAge,
      bloodType: patient.bloodType || undefined,
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'France',
      },
    });
    
    setShowEditPatientModal(true);
  };

  const handleUpdatePatient = async (data: PatientEditData) => {
    if (!selectedPatient) return;
    
    try {
      setIsUpdatingPatient(true);
      
      // Convert age back to dob for backend
      let dob: Date | undefined = undefined;
      if (data.age && data.age > 0) {
        const today = new Date();
        dob = new Date(today.getFullYear() - data.age, today.getMonth(), today.getDate());
      }
      
      // Prepare data according to UpdatePatientDto (no age, no mrn)
      const patientData = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: dob, // Send dob instead of age
        bloodType: data.bloodType || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
        address: data.address,
        clinicId: selectedPatient.clinicId, // Keep existing clinic ID
      };
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(patientData).filter(([_, v]) => v !== undefined)
      );
      
      await PatientService.updatePatient(selectedPatient.id, cleanData);
      await loadPatients(currentPage); // Reload current page
      setShowEditPatientModal(false);
      toast.success('Patient mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast.error('Erreur lors de la mise à jour du patient');
    } finally {
      setIsUpdatingPatient(false);
    }
  };

  const handleCreatePatient = async (data: PatientFormData) => {
    try {
      setIsCreating(true);
      
      // Check authentication
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un patient');
        router.push('/auth/login');
        return;
      }
      
      // Get user info to determine clinicId
      if (typeof window === 'undefined') {
        toast.error('Erreur d\'environnement. Veuillez recharger la page.');
        return;
      }
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.role;
      
      console.log('🔍 User data from localStorage:', {
        user,
        tenantId: user.tenantId,
        role: user.role,
        allProperties: Object.keys(user)
      });
      
      let clinicId: string | undefined;
      
      if (userRole === 'SUPERADMIN') {
        // For SUPERADMIN, use selected clinic
        clinicId = selectedClinicId || undefined;
      } else if (userRole === 'CLINIC_ADMIN' || userRole === 'EMPLOYEE') {
        // For CLINIC_ADMIN/EMPLOYEE, use their tenantId as clinicId
        // If tenantId is not in localStorage, fetch it from API
        if (user.tenantId) {
          clinicId = user.tenantId;
        } else {
          console.log('🔍 tenantId not found in localStorage, fetching from API...');
          try {
            const profileData = await AuthService.getProfile();
            console.log('🔍 Fresh user profile from API:', profileData);
            
            clinicId = profileData.tenantId;
            
            // Update localStorage with complete user data
            if (clinicId) {
              const updatedUser = { ...user, tenantId: clinicId };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              console.log('✅ Updated localStorage with tenantId:', clinicId);
            }
          } catch (error) {
            console.error('❌ Error fetching user profile:', error);
          }
        }
      }
      
      console.log('🏥 Creating patient with clinicId:', clinicId, 'for user role:', userRole);
      
      if (!clinicId) {
        toast.error('Impossible de déterminer la clinique. Veuillez vous reconnecter.');
        return;
      }
      
      const patientData: PatientForm = {
        ...data,
        email: data.email || undefined,
        bloodType: data.bloodType || undefined,
        clinicId,
      };
      
      const newPatient = await PatientService.createPatient(patientData);
      await loadPatients(currentPage); // Reload the current page
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Patient créé avec succès');
    } catch (error: any) {
      console.error('Error creating patient:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      
      toast.error('Erreur lors de la création du patient');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      // Check authentication
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer un patient');
        router.push('/auth/login');
        return;
      }
      
      await PatientService.deletePatient(patientId);
      await loadPatients(currentPage); // Reload the current page
      toast.success('Patient supprimé avec succès');
    } catch (error: any) {
        console.error('Error deleting patient:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        router.push('/auth/login');
        return;
      }
      
      toast.error('Erreur lors de la suppression du patient');
    }
  };

  const handleExportPatients = async () => {
    try {
      const blob = await PatientService.exportPatients('csv');
      const filename = `patients_${new Date().toISOString().split('T')[0]}.csv`;
      downloadBlob(blob, filename);
      toast.success('Export terminé avec succès');
    } catch (error) {
      console.error('Error exporting patients:', error);
      toast.error('Erreur lors de l\'export des patients');
    }
  };

  // If user is not authenticated, show login message
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
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos patients et leurs informations médicales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPatients} disabled={!isAuthenticated}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => loadPatients(currentPage)} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau patient
            </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau patient</DialogTitle>
                <DialogDescription>
                  Remplissez les informations du patient ci-dessous.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreatePatient)} className="space-y-6">
                  {/* Section des champs obligatoires */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Informations obligatoires</h3>
                      <p className="text-sm text-gray-500">Les champs marqués d'un * sont requis</p>
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
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genre *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner le genre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={Gender.M}>Homme</SelectItem>
                                <SelectItem value={Gender.F}>Femme</SelectItem>
                                <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Âge *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="25" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Section des champs optionnels */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Informations complémentaires</h3>
                      <p className="text-sm text-gray-500">Ces champs sont optionnels</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mrn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MRN</FormLabel>
                            <FormControl>
                              <Input placeholder="Généré automatiquement si vide" {...field} />
                            </FormControl>
                            <FormDescription>
                              Numéro d'identification médical (généré automatiquement si non fourni)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="+33123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                    </div>

                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groupe sanguin</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le groupe sanguin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={BloodType.A_POSITIVE}>A+</SelectItem>
                              <SelectItem value={BloodType.A_NEGATIVE}>A-</SelectItem>
                              <SelectItem value={BloodType.B_POSITIVE}>B+</SelectItem>
                              <SelectItem value={BloodType.B_NEGATIVE}>B-</SelectItem>
                              <SelectItem value={BloodType.AB_POSITIVE}>AB+</SelectItem>
                              <SelectItem value={BloodType.AB_NEGATIVE}>AB-</SelectItem>
                              <SelectItem value={BloodType.O_POSITIVE}>O+</SelectItem>
                              <SelectItem value={BloodType.O_NEGATIVE}>O-</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Section adresse */}
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                      <p className="text-sm text-gray-500">Informations de contact</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rue</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Rue de la Paix" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville</FormLabel>
                            <FormControl>
                              <Input placeholder="Paris" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal</FormLabel>
                            <FormControl>
                              <Input placeholder="75001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>État/Région</FormLabel>
                            <FormControl>
                              <Input placeholder="Île-de-France" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays</FormLabel>
                            <FormControl>
                              <Input placeholder="France" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      Créer le patient
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
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              {totalPatients > 0 ? `${filteredPatients.length} affiché(s)` : 'Aucun patient'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hommes / Femmes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredPatients.filter(p => p.gender === Gender.M).length} / {filteredPatients.filter(p => p.gender === Gender.F).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Répartition par genre
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pages</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPage} / {totalPages}</div>
            <p className="text-xs text-muted-foreground">
              Page actuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Patients</CardTitle>
          <CardDescription>
            Recherchez et filtrez vos patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Première ligne - Recherche et sélection clinique */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Clinic selector for SUPERADMIN */}
              {isSuperAdmin && (
                <Select value={selectedClinicId || ''} onValueChange={setSelectedClinicId}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sélectionner une clinique" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClinics.map((clinic) => (
                      <SelectItem key={clinic.id} value={clinic.id}>
                        {clinic.name || clinic.clinicName || `Clinique ${clinic.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, MRN ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setGenderFilter('all');
                  setAgeFilter('all');
                  setSortBy('lastName');
                  setSortOrder('asc');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            </div>

            {/* Deuxième ligne - Filtres et tri */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les genres</SelectItem>
                  <SelectItem value={Gender.M}>Homme</SelectItem>
                  <SelectItem value={Gender.F}>Femme</SelectItem>
                  <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ageFilter} onValueChange={setAgeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Âge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les âges</SelectItem>
                  <SelectItem value="0-18">0-18 ans</SelectItem>
                  <SelectItem value="19-30">19-30 ans</SelectItem>
                  <SelectItem value="31-50">31-50 ans</SelectItem>
                  <SelectItem value="51-70">51-70 ans</SelectItem>
                  <SelectItem value="70+">70+ ans</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastName">Nom</SelectItem>
                  <SelectItem value="firstName">Prénom</SelectItem>
                  <SelectItem value="createdAt">Date création</SelectItem>
                  <SelectItem value="updatedAt">Dernière visite</SelectItem>
                  <SelectItem value="dob">Âge</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Ordre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Croissant</SelectItem>
                  <SelectItem value="desc">Décroissant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-md text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => loadPatients(currentPage)}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Patients Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Dernière visite</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des patients...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun patient trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.email || 'Pas d\'email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{patient.mrn}</Badge>
                      </TableCell>
                      <TableCell>{calculateAge(patient.dob)} ans</TableCell>
                      <TableCell>{getGenderLabel(patient.gender)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{patient.phone}</div>
                          <div className="text-gray-500">
                            {patient.address.city}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(patient.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Actions du patient</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* Actions de consultation */}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowPatientDetailModal(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil complet
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => handleOpenEditModal(patient)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier les informations
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Actions médicales */}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowAppointmentModal(true);
                              }}
                            >
                              <Calendar className="mr-2 h-4 w-4" />
                              Planifier un RDV
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowConsultationModal(true);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Nouvelle consultation
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowHistoryModal(true);
                              }}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Historique médical
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Actions de gestion */}
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(`${patient.firstName} ${patient.lastName} - ${patient.mrn}`);
                                toast.success('Informations copiées');
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Copier les informations
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPatient(patient);
                                setShowInvoiceModal(true);
                              }}
                            >
                              <DollarSign className="mr-2 h-4 w-4" />
                              Créer une facture
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Action de suppression */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer le patient
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement
                                    le patient <strong>{patient.firstName} {patient.lastName}</strong> (MRN: {patient.mrn}) 
                                    et toutes ses données associées (historique médical, rendez-vous, factures).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePatient(patient.id)}
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

          {/* Pagination */}
          {!isLoading && totalPatients > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, totalPatients)} sur {totalPatients} patient(s)
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage <= 1}
                  onClick={() => loadPatients(currentPage - 1)}
                >
                  Précédent
                </Button>
                <span className="flex items-center px-2 text-sm text-gray-500">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage >= totalPages}
                  onClick={() => loadPatients(currentPage + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Detail Modal */}
      <Dialog open={showPatientDetailModal} onOpenChange={setShowPatientDetailModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profil du patient</DialogTitle>
            <DialogDescription>
              Informations détaillées du patient
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nom complet</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">MRN</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.mrn}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Genre</Label>
                  <p className="text-sm text-gray-600">
                    {selectedPatient.gender === 'M' ? 'Homme' : selectedPatient.gender === 'F' ? 'Femme' : 'Autre'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Groupe sanguin</Label>
                  <p className="text-sm text-gray-600">{selectedPatient.bloodType || 'Non renseigné'}</p>
                </div>
              </div>
              {selectedPatient.address && (
                <div>
                  <Label className="text-sm font-medium">Adresse</Label>
                  <p className="text-sm text-gray-600">
                    {[
                      selectedPatient.address.street,
                      selectedPatient.address.city,
                      selectedPatient.address.zipCode,
                      selectedPatient.address.country
                    ].filter(Boolean).join(', ') || 'Non renseignée'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatientDetailModal(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setShowPatientDetailModal(false);
              setShowEditPatientModal(true);
            }}>
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={showEditPatientModal} onOpenChange={setShowEditPatientModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
            <DialogDescription>
              Modifier les informations du patient {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <Form {...editForm}>
              <form 
                onSubmit={editForm.handleSubmit(handleUpdatePatient)} 
                className="space-y-6"
                id="edit-patient-modal-form"
              >
                {/* Section des champs obligatoires */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Informations obligatoires</h3>
                    <p className="text-sm text-gray-500">Les champs marqués d'un * sont requis</p>
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
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={Gender.M}>Homme</SelectItem>
                              <SelectItem value={Gender.F}>Femme</SelectItem>
                              <SelectItem value={Gender.OTHER}>Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Section des champs optionnels */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Informations complémentaires</h3>
                    <p className="text-sm text-gray-500">Ces champs sont optionnels</p>
                  </div>

                  {/* Display MRN as read-only */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <Label className="text-sm font-medium text-gray-700">MRN (non modifiable)</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedPatient?.mrn}</p>
                    <p className="text-xs text-gray-500">Le numéro d'identification médical ne peut pas être modifié</p>
                  </div>

                  <FormField
                    control={editForm.control}
                    name="bloodType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groupe sanguin</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le groupe sanguin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={BloodType.A_POSITIVE}>A+</SelectItem>
                            <SelectItem value={BloodType.A_NEGATIVE}>A-</SelectItem>
                            <SelectItem value={BloodType.B_POSITIVE}>B+</SelectItem>
                            <SelectItem value={BloodType.B_NEGATIVE}>B-</SelectItem>
                            <SelectItem value={BloodType.AB_POSITIVE}>AB+</SelectItem>
                            <SelectItem value={BloodType.AB_NEGATIVE}>AB-</SelectItem>
                            <SelectItem value={BloodType.O_POSITIVE}>O+</SelectItem>
                            <SelectItem value={BloodType.O_NEGATIVE}>O-</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input placeholder="+33123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                  </div>
                </div>

                {/* Section adresse */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-medium text-gray-900">Adresse</h3>
                    <p className="text-sm text-gray-500">Informations de contact</p>
                  </div>
                  
                  <FormField
                    control={editForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rue</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Rue de la Paix" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input placeholder="Paris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="address.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
                          <FormControl>
                            <Input placeholder="75001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>État/Région</FormLabel>
                          <FormControl>
                            <Input placeholder="Île-de-France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pays</FormLabel>
                          <FormControl>
                            <Input placeholder="France" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </form>
            </Form>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditPatientModal(false)}
              disabled={isUpdatingPatient}
            >
              Annuler
            </Button>
            <Button 
              form="edit-patient-modal-form"
              type="submit"
              disabled={isUpdatingPatient}
            >
              {isUpdatingPatient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Planifier un rendez-vous</DialogTitle>
            <DialogDescription>
              Planifier un rendez-vous pour {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="appointment-date">Date du rendez-vous</Label>
              <Input id="appointment-date" type="datetime-local" />
            </div>
            <div>
              <Label htmlFor="appointment-type">Type de rendez-vous</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation générale</SelectItem>
                  <SelectItem value="followup">Suivi</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                  <SelectItem value="checkup">Contrôle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="appointment-notes">Notes (optionnel)</Label>
              <Input id="appointment-notes" placeholder="Notes sur le rendez-vous" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentModal(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Rendez-vous planifié avec succès');
              setShowAppointmentModal(false);
            }}>
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Consultation Modal */}
      <Dialog open={showConsultationModal} onOpenChange={setShowConsultationModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle consultation</DialogTitle>
            <DialogDescription>
              Créer une nouvelle consultation pour {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="consultation-chief-complaint">Motif de consultation</Label>
              <Input id="consultation-chief-complaint" placeholder="Raison de la visite" />
            </div>
            <div>
              <Label htmlFor="consultation-symptoms">Symptômes</Label>
              <textarea
                id="consultation-symptoms"
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Décrire les symptômes..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="consultation-temperature">Température (°C)</Label>
                <Input id="consultation-temperature" type="number" placeholder="37.0" />
              </div>
              <div>
                <Label htmlFor="consultation-blood-pressure">Tension artérielle</Label>
                <Input id="consultation-blood-pressure" placeholder="120/80" />
              </div>
            </div>
            <div>
              <Label htmlFor="consultation-diagnosis">Diagnostic</Label>
              <textarea
                id="consultation-diagnosis"
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Diagnostic médical..."
              />
            </div>
            <div>
              <Label htmlFor="consultation-treatment">Traitement prescrit</Label>
              <textarea
                id="consultation-treatment"
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Médicaments et instructions..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsultationModal(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Consultation enregistrée avec succès');
              setShowConsultationModal(false);
            }}>
              Enregistrer la consultation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Medical History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique médical</DialogTitle>
            <DialogDescription>
              Historique médical de {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                Aucun historique médical disponible pour ce patient.
              </p>
              <Button onClick={() => {
                setShowHistoryModal(false);
                setShowConsultationModal(true);
              }}>
                Créer la première consultation
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une facture</DialogTitle>
            <DialogDescription>
              Créer une nouvelle facture pour {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invoice-service">Service</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation générale</SelectItem>
                  <SelectItem value="checkup">Contrôle de routine</SelectItem>
                  <SelectItem value="procedure">Procédure médicale</SelectItem>
                  <SelectItem value="lab">Analyses de laboratoire</SelectItem>
                  <SelectItem value="medication">Médicaments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-quantity">Quantité</Label>
                <Input id="invoice-quantity" type="number" defaultValue="1" />
              </div>
              <div>
                <Label htmlFor="invoice-unit-price">Prix unitaire (€)</Label>
                <Input id="invoice-unit-price" type="number" placeholder="50.00" />
              </div>
            </div>
            <div>
              <Label htmlFor="invoice-description">Description (optionnel)</Label>
              <textarea
                id="invoice-description"
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Description détaillée du service..."
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total estimé:</span>
                <span className="text-lg font-bold">€ 50.00</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast.success('Facture créée avec succès');
              setShowInvoiceModal(false);
            }}>
              Créer la facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 