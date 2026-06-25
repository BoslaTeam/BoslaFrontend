export type MessageType = 'text' | 'appointment' | 'video_invitation';
export type MessageStatus = 'sending' | 'delivered' | 'read';
export type SessionType = 'online' | 'in-person' | 'phone';
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface TextPayload {
  type: 'text';
  content: string;
}

export interface AppointmentData {
  id: string;
  title: string;
  date: string;        // ISO date string e.g. "2026-07-10"
  time: string;        // e.g. "14:00"
  duration: number;    // minutes
  sessionType: SessionType;
  status: AppointmentStatus;
}

export interface AppointmentPayload {
  type: 'appointment';
  appointment: AppointmentData;
}

export interface VideoSessionData {
  id: string;
  title: string;
  date: string;        // ISO date string
  startTime: string;   // e.g. "15:00"
  joinUrl: string;
}

export interface VideoInvitationPayload {
  type: 'video_invitation';
  session: VideoSessionData;
}

export type MessagePayload = TextPayload | AppointmentPayload | VideoInvitationPayload;

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  payload: MessagePayload;
  status: MessageStatus;
  createdAtUtc: string;   // ISO datetime string
  lastModifiedUtc?: string | null;
  isEdited?: boolean;
  isOwn: boolean;
}
