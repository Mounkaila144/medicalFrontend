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
} from 'lucide-react';
import Link from 'next/link';
import { Patient, Gender, BloodType, PatientForm } from '@/types';
import { PatientService } from '@/services/patient.service';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth-service';
import { ClinicService } from '@/services/clinic-service';

// Form validation schema
const patientFormSchema = z.object({
  mrn: z.string().min(1, 'Le MRN est requis'),
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  dob: z.string().min(1, 'La date de naissance est requise'),
  gender: z.nativeEnum(Gender, { errorMap: () => ({ message: 'Le genre est requis' }) }),
  bloodType: z.nativeEnum(BloodType).optional(),
  phone: z.string().min(1, 'Le téléphone est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'L\'adresse est requise'),
    city: z.string().min(1, 'La ville est requise'),
    state: z.string().min(1, 'L\'état/région est requis'),
    zipCode: z.string().min(1, 'Le code postal est requis'),
    country: z.string().min(1, 'Le pays est requis'),
  }),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

export default function PatientsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
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

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      mrn: '',
      firstName: '',
      lastName: '',
      dob: '',
      gender: Gender.M,
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

      // Build params with clinic ID
      const params: any = {
        search: searchTerm || undefined,
        page,
        limit: 10,
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
  }, [searchTerm, selectedClinicId]);

  // Update user profile on mount to ensure tenantId is available
  useEffect(() => {
    updateUserProfile();
  }, []);

  // Filter patients based on gender filter
  const filteredPatients = (patients || []).filter((patient) => {
    const matchesGender = genderFilter === 'all' || patient.gender === genderFilter;
    return matchesGender;
  });

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
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
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
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs space-y-2">
                             <div>
                 <strong>Debug Auth:</strong> {isAuthenticated ? '✅ Authentifié' : '❌ Non authentifié'} | 
                 Token: {typeof window !== 'undefined' && localStorage.getItem('accessToken') ? '✅ Présent' : '❌ Absent'} |
                 User: {typeof window !== 'undefined' && localStorage.getItem('user') ? '✅ Présent' : '❌ Absent'} |
                 SuperAdmin: {isSuperAdmin ? '✅ Oui' : '❌ Non'} |
                 Clinique: {selectedClinicId || '❌ Aucune'}
               </div>
              {typeof window !== 'undefined' && localStorage.getItem('accessToken') && (
                <div className="text-green-600">
                  <strong>Token preview:</strong> {localStorage.getItem('accessToken')?.substring(0, 30)}...
                </div>
              )}
              {typeof window !== 'undefined' && localStorage.getItem('user') && (
                <div className="text-blue-600">
                  <strong>User data:</strong> {JSON.stringify(JSON.parse(localStorage.getItem('user') || '{}'), null, 2)}
                </div>
              )}
              
              {/* Button to fetch fresh user profile */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const profileData = await AuthService.getProfile();
                    console.log('🔍 Fresh user profile from API:', profileData);
                  } catch (error) {
                    console.error('Error fetching profile:', error);
                  }
                }}
              >
                Fetch Fresh Profile
              </Button>
              <div className="flex gap-2">
                {!isAuthenticated && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/auth/login')}
                  >
                    Aller à la connexion
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      console.log('🔍 Debug Token Info:', {
                        token: localStorage.getItem('accessToken'),
                        user: localStorage.getItem('user'),
                        refreshToken: localStorage.getItem('refreshToken'),
                        isAuthenticated,
                        checkAuthResult: checkAuth()
                      });
                    }
                  }}
                >
                  Log Token Info
                </Button>
                                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={async () => {
                     console.log('🔍 Testing services...');
                     
                     // Test Auth Service
                     try {
                       const profile = await AuthService.getProfile();
                       console.log('✅ Auth Service - Profile:', profile);
                     } catch (error) {
                       console.error('❌ Auth Service - Profile Error:', error);
                     }
                     
                     // Test Clinic Service
                     try {
                       const clinics = await ClinicService.getClinics();
                       console.log('✅ Clinic Service - Clinics:', clinics);
                     } catch (error) {
                       console.error('❌ Clinic Service - Clinics Error:', error);
                     }
                     
                     // Test Patient Service
                     try {
                       const patients = await PatientService.getPatients({ limit: 5 });
                       console.log('✅ Patient Service - Patients:', patients);
                     } catch (error) {
                       console.error('❌ Patient Service - Patients Error:', error);
                     }
                   }}
                 >
                   Test Services
                 </Button>
              </div>
            </div>
          )}
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
                <form onSubmit={form.handleSubmit(handleCreatePatient)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mrn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MRN *</FormLabel>
                          <FormControl>
                            <Input placeholder="MRN-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de naissance *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groupe sanguin</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner" />
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
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

                  <div className="space-y-4">
                    <h4 className="font-medium">Adresse</h4>
                    <FormField
                      control={form.control}
                      name="address.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rue *</FormLabel>
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
                            <FormLabel>Ville *</FormLabel>
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
                            <FormLabel>Code postal *</FormLabel>
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
                            <FormLabel>État/Région *</FormLabel>
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
                            <FormLabel>Pays *</FormLabel>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/patients/${patient.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir le profil
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/patients/${patient.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Cette action ne peut pas être annulée. Cela supprimera définitivement
                                    le patient <strong>{patient.firstName} {patient.lastName}</strong> et toutes ses données associées.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeletePatient(patient.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Supprimer
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
    </div>
  );
} 