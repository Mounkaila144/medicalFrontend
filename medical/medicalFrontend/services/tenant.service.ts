import { apiClient, createQueryString } from '@/lib/api';
import { Tenant, TenantForm, Clinic, UserManagement, PaginatedResponse } from '@/types';

export interface TenantSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  plan?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  role?: string;
  tenantId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TenantService {
  // Tenant Management
  static async getTenants(params: TenantSearchParams = {}): Promise<Tenant[]> {
    const queryString = createQueryString(params);
    const endpoint = queryString ? `/admin/tenants?${queryString}` : '/admin/tenants';
    return apiClient.get<Tenant[]>(endpoint);
  }

  static async getTenantById(id: string): Promise<Tenant> {
    return apiClient.get<Tenant>(`/admin/tenants/${id}`);
  }

  static async createTenant(tenantData: any): Promise<Tenant> {
    return apiClient.post<Tenant>('/admin/tenants', tenantData);
  }

  // Note: Les endpoints updateTenant et deleteTenant ne sont pas encore implémentés dans le backend
  static async updateTenant(id: string, tenantData: Partial<TenantForm>): Promise<Tenant> {
    throw new Error('Endpoint non implémenté dans le backend');
  }

  static async deleteTenant(id: string): Promise<void> {
    throw new Error('Endpoint non implémenté dans le backend');
  }

  static async activateTenant(id: string): Promise<Tenant> {
    return apiClient.post<Tenant>(`/admin/tenants/${id}/reactivate`);
  }

  static async deactivateTenant(id: string): Promise<Tenant> {
    return apiClient.post<Tenant>(`/admin/tenants/${id}/deactivate`);
  }

  // Clinic Management within Tenants
  static async getTenantClinics(tenantId: string): Promise<Clinic[]> {
    return apiClient.get<Clinic[]>(`/admin/tenants/${tenantId}/clinics`);
  }

  static async createTenantClinic(tenantId: string, clinicData: any): Promise<Clinic> {
    return apiClient.post<Clinic>(`/admin/tenants/${tenantId}/clinics`, clinicData);
  }

  static async updateTenantClinic(tenantId: string, clinicId: string, clinicData: any): Promise<Clinic> {
    return apiClient.put<Clinic>(`/admin/tenants/${tenantId}/clinics/${clinicId}`, clinicData);
  }

  static async deleteTenantClinic(tenantId: string, clinicId: string): Promise<void> {
    return apiClient.delete<void>(`/admin/tenants/${tenantId}/clinics/${clinicId}`);
  }

  // User Management
  static async getUsers(params: UserSearchParams = {}): Promise<UserManagement[]> {
    const queryString = createQueryString(params);
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return apiClient.get<UserManagement[]>(endpoint);
  }

  static async getUserById(id: string): Promise<UserManagement> {
    return apiClient.get<UserManagement>(`/admin/users/${id}`);
  }

  static async createUser(userData: any): Promise<UserManagement> {
    return apiClient.post<UserManagement>('/users', userData);
  }

  static async updateUser(id: string, userData: any): Promise<UserManagement> {
    return apiClient.put<UserManagement>(`/admin/users/${id}`, userData);
  }

  static async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/users/${id}`);
  }

  static async activateUser(id: string): Promise<UserManagement> {
    return apiClient.post<UserManagement>(`/admin/users/${id}/activate`);
  }

  static async deactivateUser(id: string): Promise<UserManagement> {
    return apiClient.post<UserManagement>(`/admin/users/${id}/deactivate`);
  }

  static async resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
    return apiClient.post<{ temporaryPassword: string }>(`/admin/users/${id}/reset-password`);
  }

  // Statistics and Analytics
  static async getTenantStats(): Promise<{
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    recentTenants: Tenant[];
    tenantsByPlan: Record<string, number>;
  }> {
    return apiClient.get('/admin/tenants/stats');
  }

  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentUsers: UserManagement[];
  }> {
    return apiClient.get('/admin/users/stats');
  }

  // Permissions and Roles
  static async getUserPermissions(userId: string): Promise<string[]> {
    return apiClient.get<string[]>(`/admin/users/${userId}/permissions`);
  }

  static async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    return apiClient.put<void>(`/admin/users/${userId}/permissions`, { permissions });
  }

  static async getAvailableRoles(): Promise<string[]> {
    return apiClient.get<string[]>('/admin/roles');
  }

  static async getAvailablePermissions(): Promise<string[]> {
    return apiClient.get<string[]>('/admin/permissions');
  }
} 