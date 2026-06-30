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

export interface CreateSpecialistRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  country?: string;
  title?: string;
  bio?: string;
  gender?: string;
  preferredLanguage?: string;
  experienceYears: number;
  experienceLevel: string;
  hourlyRate: number;
  bookingPolicy?: string;
  expertiseIds: string[];
  industryIds: string[];
  skillIds: string[];
  toolIds: string[];
}

export interface AdminUpdateSpecialistRequest {
  fullName?: string;
  phoneNumber?: string;
  country?: string;
  title?: string;
  bio?: string;
  gender?: string;
  preferredLanguage?: string;
  experienceYears?: number;
  experienceLevel?: string;
  hourlyRate?: number;
  bookingPolicy?: string;
  verificationStatus?: string;
  expertiseIds?: string[];
  industryIds?: string[];
}

export interface AdminSpecialistListItemDto {
  id: string;
  fullName: string;
  email: string;
  title?: string;
  verificationStatus: string;
  experienceLevel: string;
  hourlyRate: number;
  rating: number;
  isOnline: boolean;
  totalSessions: number;
  totalEarnings: number;
  createdAt: string;
  profileImageUrl?: string | null;
  expertiseAreas: string[];
}

export interface SkillDto {
  id: string;
  name: string;
}

export interface ToolDto {
  id: string;
  name: string;
}

export interface ExperienceDto {
  id: string;
  jobTitle: string;
  companyName: string;
  fromDate: string;
  toDate?: string;
  description?: string;
}

export interface ReviewDto {
  id: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AdminSpecialistDetailDto {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  title?: string;
  bio?: string;
  verificationStatus: string;
  experienceLevel: string;
  experienceYears: number;
  hourlyRate: number;
  country?: string;
  gender?: string;
  preferredLanguage?: string;
  rating: number;
  isVerified: boolean;
  totalSessions: number;
  totalEarnings: number;
  totalReviews: number;
  profileImageUrl?: string | null;
  createdAt: string;
  verifiedAt?: string;
  lastLoginAt?: string;
  skills: SkillDto[];
  tools: ToolDto[];
  experiences: ExperienceDto[];
  expertiseAreas: string[];
  industries: string[];
  reviews: ReviewDto[];
}

// ── Appointments ──

export interface AdminAppointmentDetailDto {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string;
  specialistId: string;
  specialistName: string;
  specialistAvatarUrl?: string;
  start: string;
  end: string;
  durationMinutes: number;
  status: string;
  sessionTopic?: string;
  notes?: string;
  cancellationReason?: string;
  totalAmount?: number;
  paymentStatus?: string;
  createdAt: string;
  statusHistory: AdminAppointmentStatusHistoryDto[];
}

export interface AdminAppointmentStatusHistoryDto {
  oldStatus: string;
  newStatus: string;
  reason?: string;
  createdAt: string;
}

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

// ── Audit Logs ──

export interface AuditLogDto {
  id: string;
  action: string;
  userId: string;
  userName: string;
  entityType: string;
  entityId: string;
  oldValues?: string;
  newValues?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

// ── Payments ──

export interface AdminPaymentDto {
  id: string;
  appointmentId: string;
  userName: string;
  specialistName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
}

export interface AdminPaymentDetailDto {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatarUrl?: string;
  specialistId: string;
  specialistName: string;
  specialistAvatarUrl?: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  externalPaymentId?: string;
  paidAt?: string;
  platformFeeAmount: number;
  specialistAmount: number;
  taxAmount: number;
  refundReason?: string;
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
