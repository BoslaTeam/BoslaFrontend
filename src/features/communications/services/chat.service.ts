import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '@core/config/api.config';
import { ConversationPreview } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { ApiResponse } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  /** GET /api/v1/chat/conversations */
  getConversations(): Observable<ConversationPreview[]> {
    return this.http.get<ConversationPreview[]>(`${API_CONFIG.baseUrl}/chat/conversations`);

  }

  /** GET /api/v1/chat/conversations/:id/messages */
  getMessages(conversationId: string, page = 1): Observable<ApiResponse<Message[]>> {
    return this.http.get<ApiResponse<Message[]>>(`${API_CONFIG.baseUrl}/chat/conversations/${conversationId}/messages`, { params: { page } });
  }

  /** POST /api/v1/chat/conversations/:id/messages */
  sendMessage(conversationId: string, content: string): Observable<Message> {
    return this.http.post<Message>(`${API_CONFIG.baseUrl}/chat/conversations/${conversationId}/messages`, { content });
  }

  /** PATCH /api/v1/chat/conversations/:id/read */
  markAsRead(conversationId: string): Observable<void> {
    return this.http.patch<void>(`${API_CONFIG.baseUrl}/chat/conversations/${conversationId}/read`, {});
  }
}
