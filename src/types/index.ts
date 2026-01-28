// User types
export interface User {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  telegramId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type UserRole = 'user' | 'doctor' | 'admin' | 'super_admin' | 'reception' | 'driver' | 'lab_technician';

export type UserStatus = 'active' | 'inactive' | 'blocked';

// Auth types
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export interface LoginDto {
  phone: string;
  code: string;
}

export interface RegisterDto {
  phone: string;
  name: string;
  address?: string;
}

// Doctor types
export interface Doctor {
  id: string;
  userId: string;
  user?: User;
  category?: Category;
  categoryId: string;
  specialization: string;
  experience: number;
  education: string;
  bio: string;
  rating: number;
  reviewCount: number;
  reviewsCount?: number;
  patientsCount?: number;
  consultationFee: number;
  consultationPrice?: number; // Backend shu nomda qaytaradi
  isAvailable: boolean;
  isActive?: boolean;
  isApproved?: boolean;
  clinicId?: string;
  clinic?: Clinic;
  schedules?: DoctorSchedule[];
  createdAt: string;
}

export interface CreateDoctorDto {
  userId: string;
  fullName: string;
  phone: string;
  categoryId: string;
  clinicId?: string;
  specialization: string;
  bio?: string;
  experience?: number;
  consultationPrice?: number;
  schedules?: CreateDoctorScheduleDto[];
}

export interface CreateDoctorScheduleDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  slotDuration?: number;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

// Category types
export interface Category {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  description: string;
  icon: string;
  isActive: boolean;
  doctorCount?: number;
}

// Clinic types
export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  workingHours?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

// Appointment types
export interface Appointment {
  id: string;
  userId: string;
  user?: User;
  patient?: User;
  patientId?: string;
  doctorId: string;
  doctor?: Doctor;
  appointmentDate: string;
  appointmentTime?: string;
  date?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  userNotes?: string;
  doctorNotes?: string;
  cancelReason?: string;
  price?: number;
  service?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected' | 'no_show';

export interface CreateAppointmentDto {
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  notes?: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  nameUz: string;
  nameRu: string;
  description: string;
  descriptionUz?: string;
  descriptionRu?: string;
  type: ServiceType;
  price: number;
  duration: number;
  isActive: boolean;
}

export enum ServiceType {
  LABORATORY = 'laboratory',
  DIAGNOSTIC = 'diagnostic',
  HOME_VISIT = 'home_visit',
  CONSULTATION = 'consultation',
}

export interface ServiceOrder {
  id: string;
  userId: string;
  serviceId: string;
  service?: Service;
  status: ServiceOrderStatus;
  scheduledDate?: string;
  startDate?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export enum ServiceOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export enum NotificationType {
  APPOINTMENT = 'appointment',
  REMINDER = 'reminder',
  SYSTEM = 'system',
  PROMOTION = 'promotion',
}

// Home Visit / Driver types
export interface HomeVisit {
  id: string;
  userId: string;
  driverId?: string;
  driver?: Driver;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: HomeVisitStatus;
  notes?: string;
  createdAt: string;
}

export enum HomeVisitStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Driver {
  id: string;
  userId: string;
  user?: User;
  vehicleNumber: string;
  vehicleType: string;
  isAvailable: boolean;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Statistics types
export interface DashboardStats {
  users: {
    total: number;
    thisMonth: number;
  };
  doctors: {
    total: number;
    active: number;
  };
  appointments: {
    total: number;
    today: number;
    thisMonth: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
  };
}

export interface DoctorStats {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  rating: number;
  reviewCount: number;
}

// Available slot type
export interface AvailableSlot {
  time: string;
  isAvailable: boolean;
}

// Telegram WebApp types
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  BackButton: {
    isVisible: boolean;
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  openLink(url: string): void;
  showPopup(params: object): void;
  showAlert(message: string): void;
  showConfirm(message: string, callback: (confirmed: boolean) => void): void;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

// Role Request types
export interface RoleRequest {
  id: string;
  userId: string;
  user?: User;
  requestedRole: UserRole;
  currentRole: UserRole;
  reason: string;
  status: RoleRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export type RoleRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CreateRoleRequestDto {
  requestedRole: UserRole;
  reason: string;
  additionalData?: Record<string, any>;
}

export interface ReviewRoleRequestDto {
  status: 'approved' | 'rejected';
  reviewNote?: string;
}

// Laboratory Test types
export interface LaboratoryTest {
  id: string;
  patientId: string;
  patient?: User;
  medicalCardNumber: string;
  patientName: string;
  referralType: 'ordinary' | 'privileged';
  referredFrom: string;
  referredBy?: string;
  referredByUser?: User;
  department: string;
  priceCategory: string;
  status: LaboratoryTestStatus;
  createdAt: string;
  updatedAt: string;
}

export type LaboratoryTestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface LaboratoryResult {
  id: string;
  testId: string;
  test?: LaboratoryTest;
  result: string;
  notes?: string;
  completedBy?: string;
  completedAt: string;
}
