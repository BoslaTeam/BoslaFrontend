export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAtUtc: string;
  appointmentId?: string;
  appointmentStatus?: number;
}
