export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginationMetadata {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  metadata: PaginationMetadata;
}

export interface ConversationParticipantDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  isOnline: boolean;
  lastSeenAt: string | null;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  specialization?: string;
}

export interface ConversationDto {
  id: string;
  participants: ConversationParticipantDto[];
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  isEdited: boolean;
  createdAtUtc: string;
  lastModifiedUtc: string;
  // Optional client-side state / event fields
  status?: 'sending' | 'delivered' | 'read';
  payload?: any;
  isOwn?: boolean;
}
