export interface NotificationPreferenceDto {
  type: string;
  enabled: boolean;
}

export interface UpdateNotificationPreferenceRequest {
  enabled: boolean;
}
