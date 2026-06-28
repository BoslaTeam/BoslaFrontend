export enum AppointmentStatus {
  Pending = 0,
  Confirmed = 1,
  Completed = 2,
  Cancelled = 3,
  Rejected = 4
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
