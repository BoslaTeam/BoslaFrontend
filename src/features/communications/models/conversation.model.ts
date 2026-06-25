export type UserRole = 'user' | 'specialist' | 'consultant' | 'business';

export interface Participant {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  isOnline: boolean;
  lastSeenAt: string | null;   // ISO datetime
  bio?: string;
  rating?: number;
  reviewCount?: number;
  specialization?: string;
}

export interface ConversationPreview {
  id: string;
  participant: Participant;
  lastMessage: string;
  lastMessageAt: string;  // ISO datetime
  unreadCount: number;
}

export type ChatFilter = 'all' | 'unread';
