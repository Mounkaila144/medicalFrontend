// Configuration centralisée des endpoints API
export const API_CONFIG = {
  // Base URL - peut être changée selon l'environnement
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // Endpoints d'authentification
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Endpoints patients
  PATIENTS: {
    LIST: '/patients',
    CREATE: '/patients',
    GET_BY_ID: (id: string) => `/patients/${id}`,
    UPDATE: (id: string) => `/patients/${id}`,
    DELETE: (id: string) => `/patients/${id}`,
    EXPORT: '/patients/export',
  },
  
  // Endpoints cliniques/tenants
  CLINICS: {
    LIST: '/clinics',
    CREATE: '/clinics',
    GET_BY_ID: (id: string) => `/clinics/${id}`,
    UPDATE: (id: string) => `/clinics/${id}`,
    DELETE: (id: string) => `/clinics/${id}`,
  },
  
  // Endpoints admin
  ADMIN: {
    TENANTS: '/admin/tenants',
    USERS: '/admin/users',
    CREATE_TENANT: '/admin/tenants',
    DEACTIVATE_TENANT: (id: string) => `/admin/tenants/${id}/deactivate`,
    REACTIVATE_TENANT: (id: string) => `/admin/tenants/${id}/reactivate`,
  },
  
  // Endpoints utilisateurs
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  
  // Endpoints praticiens
  PRACTITIONERS: {
    LIST: '/practitioners',
    CREATE: '/practitioners',
    GET_BY_ID: (id: string) => `/practitioners/${id}`,
    UPDATE: (id: string) => `/practitioners/${id}`,
    DELETE: (id: string) => `/practitioners/${id}`,
  },
  
  // Endpoints rendez-vous
  APPOINTMENTS: {
    LIST: '/appointments',
    CREATE: '/appointments',
    GET_BY_ID: (id: string) => `/appointments/${id}`,
    UPDATE: (id: string) => `/appointments/${id}`,
    DELETE: (id: string) => `/appointments/${id}`,
    RESCHEDULE: '/appointments/reschedule',
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
  },
};

// Helper pour construire une URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper pour les headers d'authentification
export const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}; 