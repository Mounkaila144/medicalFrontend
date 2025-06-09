// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId?: string;
  isActive: boolean;
}

export interface Practitioner extends BaseEntity {
  firstName: string;
  lastName: string;
  speciality: Speciality;
  email: string;
  phoneNumber: string;
  workingHours: WorkingHour[];
  slotDuration: number;
  color: string;
  isActive: boolean;
  tenantId: string;
}

export interface Patient extends BaseEntity {
  clinicId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  bloodType?: BloodType;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact?: EmergencyContact;
}

export interface Appointment extends BaseEntity {
  patientId: string;
  practitionerId: string;
  startAt: string;
  endAt: string;
  room?: string;
  reason: string;
  urgency: Urgency;
  status: AppointmentStatus;
  cancellationReason?: string;
  patient?: Patient;
  practitioner?: Practitioner;
}

export interface Encounter extends BaseEntity {
  patientId: string;
  practitionerId: string;
  appointmentId?: string;
  startAt: string;
  endAt?: string;
  motive: string;
  exam?: string;
  diagnosis?: string;
  assessment?: string;
  plan?: string;
  icd10Codes?: string[];
  status: EncounterStatus;
  patient?: Patient;
  practitioner?: Practitioner;
}

export interface Prescription extends BaseEntity {
  encounterId: string;
  practitionerId: string;
  expiresAt: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  encounter?: Encounter;
  practitioner?: Practitioner;
}

export interface Invoice extends BaseEntity {
  patientId: string;
  encounterId?: string;
  number: string;
  issueDate: string;
  dueAt: string;
  status: InvoiceStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  lines: InvoiceLine[];
  patient?: Patient;
  encounter?: Encounter;
}

export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
  notes?: string;
  invoice?: Invoice;
}

export interface LabResult extends BaseEntity {
  patientId: string;
  encounterId?: string;
  labName: string;
  result: Record<string, any>;
  receivedAt: string;
  patient?: Patient;
  encounter?: Encounter;
}

export interface MedicalHistory extends BaseEntity {
  patientId: string;
  type: MedicalHistoryType;
  label: string;
  note?: string;
  patient?: Patient;
}

export interface WaitQueueEntry extends BaseEntity {
  patientId: string;
  practitionerId: string;
  priority: Priority;
  reason: string;
  estimatedWaitTime?: number;
  patient?: Patient;
  practitioner?: Practitioner;
}

// Supporting types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface WorkingHour {
  dayOfWeek: DayOfWeek;
  slots: TimeSlot[];
}

export interface TimeSlot {
  start: string;
  end: string;
}

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  tax: number;
  thirdPartyRate: number;
  total: number;
}

// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CLINIC_ADMIN = 'CLINIC_ADMIN',
  PRACTITIONER = 'PRACTITIONER',
  STAFF = 'STAFF'
}

export enum Speciality {
  CARDIOLOGY = 'CARDIOLOGY',
  DERMATOLOGY = 'DERMATOLOGY',
  ENDOCRINOLOGY = 'ENDOCRINOLOGY',
  GASTROENTEROLOGY = 'GASTROENTEROLOGY',
  GENERAL_PRACTICE = 'GENERAL_PRACTICE',
  NEUROLOGY = 'NEUROLOGY',
  ONCOLOGY = 'ONCOLOGY',
  ORTHOPEDICS = 'ORTHOPEDICS',
  PEDIATRICS = 'PEDIATRICS',
  PSYCHIATRY = 'PSYCHIATRY',
  RADIOLOGY = 'RADIOLOGY',
  SURGERY = 'SURGERY'
}

export enum Gender {
  M = 'M',
  F = 'F',
  OTHER = 'OTHER'
}

export enum BloodType {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export enum Urgency {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export enum EncounterStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PrescriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  INSURANCE = 'INSURANCE'
}

export enum MedicalHistoryType {
  ALLERGY = 'ALLERGY',
  MEDICATION = 'MEDICATION',
  SURGERY = 'SURGERY',
  CONDITION = 'CONDITION',
  FAMILY_HISTORY = 'FAMILY_HISTORY'
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
  practitioner?: Practitioner;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface PatientForm {
  clinicId?: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: Gender;
  bloodType?: BloodType;
  phone: string;
  email?: string;
  address: Address;
  emergencyContact?: EmergencyContact;
}

export interface AppointmentForm {
  patientId: string;
  practitionerId: string;
  startAt: string;
  endAt: string;
  room?: string;
  reason: string;
  urgency: Urgency;
}

export interface EncounterForm {
  patientId: string;
  practitionerId: string;
  appointmentId?: string;
  startAt: string;
  motive: string;
  exam?: string;
  diagnosis?: string;
  assessment?: string;
  plan?: string;
  icd10Codes?: string[];
}

// Dashboard types
export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingInvoices: number;
  monthlyRevenue: number;
  appointmentsByStatus: Record<AppointmentStatus, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topPractitioners: Array<{ name: string; appointments: number }>;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: Appointment;
  color?: string;
}

export interface CalendarView {
  month: Date;
  events: CalendarEvent[];
}

// User Management Types
export interface UserManagement {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPERADMIN' | 'CLINIC_ADMIN' | 'EMPLOYEE' | 'PRACTITIONER';
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Simplified Tenant Types (matching backend)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  users?: UserManagement[];
}

export interface TenantForm {
  name: string;
  slug: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
}

// Legacy types kept for compatibility
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  maxUsers: number;
  maxClinics: number;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Search and Filter Interfaces
export interface SearchFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  plan?: SubscriptionPlan | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} 