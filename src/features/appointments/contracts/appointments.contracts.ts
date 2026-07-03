import { AppointmentStatus } from '@core/enums/appointment-status.enum';

export interface CreateAppointmentRequest {
  specialistId: string;
  start: string | Date;
  end: string | Date;
  sessionTopic?: string;
  notes?: string;
}

export interface CancelAppointmentRequest {
  reason: string;
}

export interface RejectAppointmentRequest {
  reason: string;
}

export interface RescheduleAppointmentRequest {
  newStart: string | Date;
  newEnd: string | Date;
}

export interface UpdateAppointmentNotesRequest {
  notes: string;
}

export interface AddReminderRequest {
  reminderTime: string | Date;
  message: string;
}

export interface AddReviewRequest {
  rating: number;
  comment?: string;
}

export enum PaymentStatus {
  Unpaid = 0,
  Paid = 1,
  Refunded = 2,
}

export interface AppointmentDto {
  id: string;
  specialistId: string;
  userId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  sessionTopic?: string;
  notes?: string;
  specialistName?: string;
  specialistTitle?: string;
  specialistImageUrl?: string;
  sessionPrice?: number;
  paymentStatus?: PaymentStatus;
  conversationId?: string;
}

export interface AppointmentStatusHistoryDto {
  id: string;
  oldStatus: AppointmentStatus;
  newStatus: AppointmentStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface ReminderDto {
  id: string;
  appointmentId: string;
  reminderTime: string;
  message: string;
  isSent: boolean;
}

export interface SpecialistBrief {
  id: string;
  name: string;
  title: string | null;
  imageUrl: string | null;
  rating: number;
  hourlyRate: number;
  reviewsCount: number;
}

export interface SpecialistFullDetail extends SpecialistBrief {
  bio: string | null;
  skills: { id: string; name: string }[];
  isOnline: boolean;
  country: string | null;
}

export interface SessionSummaryDto {
  id: string;
  appointmentId: string;
  transcriptId?: string;
  keyTakeaways: string;
  actionItemsForUser: string;
  actionItemsForSpec: string;
  llmProvider: string;
  status: number;
  createdAtUtc: string;
  createdBy?: string;
  lastModifiedUtc?: string;
  lastModifiedBy?: string;
}

export interface AvailabilitySlotDto {
  id: string;
  start: string;
  end: string;
  isBooked?: boolean;
}
