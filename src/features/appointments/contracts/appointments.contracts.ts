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


export interface AppointmentDto {
  id: string;
  specialistId: string;
  userId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  sessionTopic?: string;
  notes?: string;
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