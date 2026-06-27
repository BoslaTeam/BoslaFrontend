import type { MessagePayload } from './message.model';

export interface AppointmentDto {
  id: string;
  specialistId: string;
  userId: string;
  start: string;
  end: string;
  status: number;
  sessionTopic: string | null;
  notes: string | null;
}

export interface ConversationParticipantDto {
  userId: string;
  fullName: string;
  profilePictureUrl: string | null;
  role: number;
}

export interface ConversationDto {
  id: string;
  appointmentId: string;
  createdAtUtc: string;
  participants: ConversationParticipantDto[];
  lastMessage: MessageDto | null;
  // Client-side fields
  unreadCount?: number;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  isEdited: boolean;
  createdAtUtc: string;
  lastModifiedUtc: string | null;
  // Client-side state fields
  isDeleted?: boolean;
  status?: 'sending' | 'delivered' | 'read';
  payload?: MessagePayload;
  isOwn?: boolean;
}
