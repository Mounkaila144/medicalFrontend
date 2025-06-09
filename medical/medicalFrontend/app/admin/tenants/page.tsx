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
  Building,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Crown,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Tenant, TenantForm, SubscriptionPlan, SubscriptionStatus } from '@/types';
import { TenantService } from '@/services/tenant.service';

// Form validation schema - correspondant au CreateTenantDto backend
const tenantFormSchema = z.object({
  name: z.string().min(1, 'Le nom du tenant est requis'),
  slug: z.string().min(3, 'Le slug doit contenir au moins 3 caractères').regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  adminEmail: z.string().email('Email invalide'),
  adminFirstName: z.string().min(1, 'Le prénom de l\'administrateur est requis'),
  adminLastName: z.string().min(1, 'Le nom de l\'administrateur est requis'),
  adminPassword: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type TenantFormData = z.infer<typeof tenantFormSchema>;

export default function TenantsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTenants, setTotalTenants] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      adminEmail: '',
      adminFirstName: '',
      adminLastName: '',
      adminPassword: '',
    },
  });

  // Load tenants from API
  const loadTenants = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux tenants');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const params: any = {
        search: searchTerm || undefined,
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        plan: planFilter !== 'all' ? planFilter : undefined,
      };
      
      console.log('🔍 Loading tenants with params:', params);
      
      const tenantsList = await TenantService.getTenants(params);
      console.log('🔍 Received tenants:', tenantsList);
      
      setTenants(tenantsList);
      setCurrentPage(page);
      // Pour l'instant, sans pagination backend, on simule
      setTotalPages(1);
      setTotalTenants(tenantsList.length);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      
      if (error.status === 401 || error.status === 403) {
        console.error('🔍 Auth Error Details:', {
          status: error.status,
          message: error.message,
          data: error.data,
        });
        setError(`Erreur ${error.status}: Accès non autorisé`);
        toast.error('Accès non autorisé. Vous devez être SUPERADMIN.');
        return;
      }
      
      setError('Erreur lors du chargement des tenants');
      toast.error('Erreur lors du chargement des tenants');
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      // Calculer les stats localement depuis les données tenants
      if (tenants && tenants.length > 0) {
        const activeTenantsCount = tenants.filter(t => t.isActive).length;
        
        setStats({
          totalTenants: tenants.length,
          activeTenants: activeTenantsCount,
          totalUsers: tenants.reduce((acc, tenant) => acc + (tenant.users?.length || 0), 0),
          recentTenants: tenants.slice(0, 5),
          tenantsByPlan: {} // Pas de plans dans votre backend pour l'instant
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load tenants on mount and when search/filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTenants(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, planFilter]);

  // Load stats when tenants change
  useEffect(() => {
    loadStats();
  }, [tenants]);

  // Filter tenants
  const filteredTenants = tenants || [];

  const handleCreateTenant = async (data: TenantFormData) => {
    try {
      setIsCreating(true);
      
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un tenant');
        router.push('/auth/login');
        return;
      }
      
      const tenantData = {
        name: data.name,
        slug: data.slug,
        adminEmail: data.adminEmail,
        adminFirstName: data.adminFirstName,
        adminLastName: data.adminLastName,
        adminPassword: data.adminPassword,
      };
      
      const newTenant = await TenantService.createTenant(tenantData);
      console.log('✅ Tenant créé:', newTenant);
      
      console.log('🔄 Recharging tenant list...');
      await loadTenants(1); // Retour à la première page
      await loadStats();
      
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Tenant créé avec succès');
    } catch (error: any) {
      console.error('Error creating tenant:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Accès non autorisé');
        return;
      }
      
      toast.error('Erreur lors de la création du tenant');
    } finally {
      setIsCreating(false);
    }
  };



  const handleToggleTenantStatus = async (tenantId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await TenantService.deactivateTenant(tenantId);
        toast.success('Tenant désactivé');
      } else {
        await TenantService.activateTenant(tenantId);
        toast.success('Tenant activé');
      }
      
      await loadTenants(currentPage);
      await loadStats();
    } catch (error: any) {
      console.error('Error toggling tenant status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
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
                Vous devez être connecté en tant que SUPERADMIN pour accéder à cette page.
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Tenants</h1>
          <p className="text-gray-600 mt-1">
            Gérez les tenants, leurs propriétaires et leurs abonnements
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadTenants(currentPage)} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau tenant</DialogTitle>
                <DialogDescription>
                  Créez un nouveau tenant avec son propriétaire et ses paramètres d'abonnement.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateTenant)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du Tenant *</FormLabel>
                          <FormControl>
                            <Input placeholder="Clinique Medical Center" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="medical-center" 
                              {...field} 
                              onChange={(e) => {
                                // Convertir automatiquement en slug valide
                                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                                field.onChange(slug);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Identifiant unique du tenant (lettres, chiffres, tirets uniquement)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Administrateur du Tenant</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminFirstName"
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
                        name="adminLastName"
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
                    <FormField
                      control={form.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="admin@clinique.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Minimum 8 caractères pour l'administrateur du tenant
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      Créer le Tenant
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTenants}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTenants} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Tous tenants confondus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plans Payants</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.tenantsByPlan?.BASIC || 0) + (stats.tenantsByPlan?.PROFESSIONAL || 0) + (stats.tenantsByPlan?.ENTERPRISE || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Hors plan gratuit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagination</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPage} / {totalPages}</div>
              <p className="text-xs text-muted-foreground">
                Page actuelle
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tenants</CardTitle>
          <CardDescription>
            Recherchez et gérez vos tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email du propriétaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value={SubscriptionPlan.FREE}>Gratuit</SelectItem>
                <SelectItem value={SubscriptionPlan.BASIC}>Basique</SelectItem>
                <SelectItem value={SubscriptionPlan.PROFESSIONAL}>Professionnel</SelectItem>
                <SelectItem value={SubscriptionPlan.ENTERPRISE}>Entreprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-md text-red-700 mb-6">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => loadTenants(currentPage)}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Tenants Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Administrateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des tenants...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun tenant trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTenants.map((tenant) => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-gray-500">
                            Slug: {tenant.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {tenant.users && tenant.users.length > 0 ? (
                            (() => {
                              const admin = tenant.users.find(u => u.role === 'CLINIC_ADMIN');
                              return admin ? (
                                <div>
                                  <div className="font-medium">
                                    {admin.firstName} {admin.lastName}
                                  </div>
                                  <div className="text-gray-500 flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {admin.email}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Aucun admin assigné</span>
                              );
                            })()
                          ) : (
                            <span className="text-gray-400">Chargement...</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                          {tenant.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {tenant.users?.length || 0} utilisateur(s)
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(tenant.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Primary Action: Toggle Status */}
                          <Button
                            variant={tenant.isActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleToggleTenantStatus(tenant.id, tenant.isActive)}
                            className={tenant.isActive ? 
                              "text-orange-600 hover:text-orange-700 border-orange-200" : 
                              "bg-green-600 hover:bg-green-700 text-white"
                            }
                          >
                            {tenant.isActive ? (
                              <>
                                <PowerOff className="mr-1 h-3 w-3" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Power className="mr-1 h-3 w-3" />
                                Activer
                              </>
                            )}
                          </Button>
                          
                          {/* Secondary Actions */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions disponibles</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => router.push(`/admin/users?tenantId=${tenant.id}`)}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Voir les utilisateurs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled className="text-gray-400">
                                <Eye className="mr-2 h-4 w-4" />
                                Détails (bientôt disponible)
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled className="text-gray-400">
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier (bientôt disponible)
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled className="text-gray-400">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer (bientôt disponible)
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && totalTenants > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, totalTenants)} sur {totalTenants} tenant(s)
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage <= 1}
                  onClick={() => loadTenants(currentPage - 1)}
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
                  onClick={() => loadTenants(currentPage + 1)}
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