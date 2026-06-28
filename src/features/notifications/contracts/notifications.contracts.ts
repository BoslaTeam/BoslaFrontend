export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  link?: string;
}
