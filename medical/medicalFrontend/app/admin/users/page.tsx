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
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Building,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
  Key,
  Mail,
  Phone,
  Globe,
  Shield,
  Crown,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserManagement, Tenant, UserRole } from '@/types';
import { TenantService } from '@/services/tenant.service';

// Form validation schema - correspondant au CreateUserDto backend
const userFormSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  role: z.enum(['SUPERADMIN', 'CLINIC_ADMIN', 'EMPLOYEE', 'PRACTITIONER'], {
    errorMap: () => ({ message: 'Le rôle doit être valide' })
  }),
  tenantId: z.string().uuid('Le tenant doit être un UUID valide').optional(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type UserFormData = z.infer<typeof userFormSchema>;

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [tenantFilter, setTenantFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'EMPLOYEE',
      tenantId: '',
      password: '',
    },
  });

  // Load users from API
  const loadUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!checkAuth()) {
        setError('Vous devez être connecté pour accéder aux utilisateurs');
        toast.error('Veuillez vous connecter pour continuer');
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }

      const params: any = {
        search: searchTerm || undefined,
        page,
        limit: 10,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        tenantId: tenantFilter !== 'all' ? tenantFilter : undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      };
      
      console.log('🔍 Loading users with params:', params);
      
      const usersList = await TenantService.getUsers(params);
      console.log('🔍 Received users:', usersList);
      
      setUsers(usersList || []);
      setCurrentPage(page);
      // Pour l'instant, sans pagination backend, on simule
      setTotalPages(1);
      setTotalUsers(usersList?.length || 0);
    } catch (error: any) {
      console.error('Error loading users:', error);
      
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
      
      setError('Erreur lors du chargement des utilisateurs');
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  // Load tenants for dropdown
  const loadTenants = async () => {
    try {
      const tenantsList = await TenantService.getTenants({ limit: 100 });
      setTenants(tenantsList || []); // Assure que c'est un tableau
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]); // Fallback à un tableau vide en cas d'erreur
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      // Calculer les stats localement depuis les données users
      if (users.length > 0) {
        const usersByRole = users.reduce((acc: any, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter(u => u.isActive).length,
          usersByRole
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load users on mount and when search/filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, tenantFilter, statusFilter]);

  // Load tenants on mount and stats when users change
  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    loadStats();
  }, [users]);

  const handleCreateUser = async (data: UserFormData) => {
    try {
      setIsCreating(true);
      
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour créer un utilisateur');
        router.push('/auth/login');
        return;
      }
      
      const userData = {
        ...data,
      };
      
      const newUser = await TenantService.createUser(userData);
      await loadUsers(currentPage);
      await loadStats();
      setIsCreateModalOpen(false);
      form.reset();
      toast.success('Utilisateur créé avec succès');
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Accès non autorisé');
        return;
      }
      
      toast.error('Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (!checkAuth()) {
        toast.error('Vous devez être connecté pour supprimer un utilisateur');
        router.push('/auth/login');
        return;
      }
      
      await TenantService.deleteUser(userId);
      await loadUsers(currentPage);
      await loadStats();
      toast.success('Utilisateur supprimé avec succès');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      if (error.status === 401 || error.status === 403) {
        toast.error('Accès non autorisé');
        return;
      }
      
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await TenantService.deactivateUser(userId);
        toast.success('Utilisateur désactivé');
      } else {
        await TenantService.activateUser(userId);
        toast.success('Utilisateur activé');
      }
      
      await loadUsers(currentPage);
      await loadStats();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const result = await TenantService.resetUserPassword(userId);
      
      // Show temporary password in a modal or copy to clipboard
      navigator.clipboard.writeText(result.temporaryPassword);
      toast.success(`Mot de passe réinitialisé. Temporaire copié: ${result.temporaryPassword}`);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getRoleLabel = (role: string): string => {
    switch (role) {
      case 'SUPERADMIN':
        return 'Super Admin';
      case 'CLINIC_ADMIN':
        return 'Admin Clinique';
      case 'PRACTITIONER':
        return 'Praticien';
      case 'EMPLOYEE':
        return 'Employé';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'SUPERADMIN':
        return 'bg-red-100 text-red-800';
      case 'CLINIC_ADMIN':
        return 'bg-orange-100 text-orange-800';
      case 'PRACTITIONER':
        return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">
            Gérez tous les utilisateurs du système
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadUsers(currentPage)} variant="outline" size="sm" disabled={!isAuthenticated}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                <DialogDescription>
                  Créez un nouvel utilisateur et assignez-le à un tenant.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
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

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rôle *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un rôle" />
                              </SelectTrigger>
                            </FormControl>
                                                          <SelectContent>
                                <SelectItem value="EMPLOYEE">Employé</SelectItem>
                                <SelectItem value="PRACTITIONER">Praticien</SelectItem>
                                <SelectItem value="CLINIC_ADMIN">Admin Clinique</SelectItem>
                                <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                              </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tenantId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tenant</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un tenant (optionnel pour SUPERADMIN)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Aucun tenant (SUPERADMIN)</SelectItem>
                              {tenants.map((tenant) => (
                                <SelectItem key={tenant.id} value={tenant.id}>
                                  {tenant.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Requis pour tous les rôles sauf SUPERADMIN
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe temporaire *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          L'utilisateur devra changer ce mot de passe à sa première connexion
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
                      Créer l'Utilisateur
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
              <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Praticiens</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.usersByRole?.PRACTITIONER || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Praticiens actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.usersByRole?.SUPERADMIN || 0) + (stats.usersByRole?.CLINIC_ADMIN || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Super + Clinique
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
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            Recherchez et gérez vos utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
                              <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  <SelectItem value="CLINIC_ADMIN">Admin Clinique</SelectItem>
                  <SelectItem value="PRACTITIONER">Praticien</SelectItem>
                  <SelectItem value="EMPLOYEE">Employé</SelectItem>
                </SelectContent>
            </Select>
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Tenant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les tenants</SelectItem>
                {tenants && tenants.length > 0 ? (
                  tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Chargement des tenants...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-4 border border-red-200 bg-red-50 rounded-md text-red-700 mb-6">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={() => loadUsers(currentPage)}>
                Réessayer
              </Button>
            </div>
          )}

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                        <p className="text-gray-500">Chargement des utilisateurs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">Aucun utilisateur trouvé</p>
                        {searchTerm && (
                          <p className="text-sm text-gray-400">
                            Essayez de modifier vos critères de recherche
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{user.tenant?.name || 'N/A'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                              onClick={() => router.push(`/admin/users/${user.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Voir les détails
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/users/${user.id}/permissions`)}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Gérer permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleResetPassword(user.id)}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Réinitialiser mot de passe
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            >
                              {user.isActive ? (
                                <>
                                  <PowerOff className="mr-2 h-4 w-4" />
                                  Désactiver
                                </>
                              ) : (
                                <>
                                  <Power className="mr-2 h-4 w-4" />
                                  Activer
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
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
                                    l'utilisateur <strong>{user.firstName} {user.lastName}</strong> et toutes ses données associées.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
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
          {!isLoading && totalUsers > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Affichage de {(currentPage - 1) * 10 + 1} à {Math.min(currentPage * 10, totalUsers)} sur {totalUsers} utilisateur(s)
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage <= 1}
                  onClick={() => loadUsers(currentPage - 1)}
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
                  onClick={() => loadUsers(currentPage + 1)}
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