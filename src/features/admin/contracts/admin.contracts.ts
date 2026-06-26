import { UserRole } from '@core/enums/user-role.enum';

// ── Dashboard ──

export interface AdminDashboardDto {
  totalUsers: number;
  totalSpecialists: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeAppointments: number;
  recentUsers: AdminUserDto[];
  recentAppointments: AdminAppointmentDto[];
  userGrowthPercentage: number;
  revenueGrowthPercentage: number;
  appointmentGrowthPercentage: number;
  specialistGrowthPercentage: number;
}

// ── Users ──

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  country?: string;
  role: number;
}

export interface UpdateUserRequest {
  fullName: string;
  phoneNumber?: string;
  country?: string;
  title?: string;
  bio?: string;
  gender?: string;
  preferredLanguage?: string;
  isActive: boolean;
  role: number;
}

export interface AdminUserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string | null;
}

export interface AdminUserDetailDto extends AdminUserDto {
  phoneNumber?: string;
  country?: string;
  title?: string;
  bio?: string;
  gender?: string;
  preferredLanguage?: string;
  profilePictureUrl?: string | null;
  education: AdminEducationDto[];
  socialLinks: AdminSocialLinkDto[];
  appointmentsCount: number;
  lastLoginAt?: string;
}

export interface AdminEducationDto {
  id: string;
  degree: string;
  institution: string;
  startYear: number;
  endYear?: number;
}

export interface AdminSocialLinkDto {
  id: string;
  platform: string;
  url: string;
}

// ── Specialists ──

export interface PendingSpecialistDto {
  id: string;
  fullName: string;
  email: string;
  title?: string;
  createdAt: string;
  avatarUrl?: string | null;
  expertiseAreas: string[];
}

export interface AdminSpecialistDetailDto extends PendingSpecialistDto {
  bio?: string;
  isVerified: boolean;
  rating?: number;
  totalSessions: number;
  totalEarnings: number;
}

// ── Appointments ──

export interface AdminAppointmentDto {
  id: string;
  userId: string;
  userName: string;
  specialistId: string;
  specialistName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: number;
  totalAmount: number;
  createdAt: string;
}

// ── Payments ──

export interface AdminPaymentDto {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  status: number;
  createdAt: string;
  method?: string;
}

// ── Audit Logs ──

export interface AuditLogDto {
  id: string;
  action: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

// ── AI Embeddings ──

export interface EmbeddingsStatusDto {
  totalSpecialists: number;
  embeddedCount: number;
  pendingCount: number;
  lastRebuildAt?: string;
  status: string;
}
