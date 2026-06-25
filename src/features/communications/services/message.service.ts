import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { MessageDto, ApiResponse, PaginatedResult } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly http = inject(HttpClient);

  getMessages(
    conversationId: string,
    pageNumber: number,
    pageSize: number
  ): Observable<ApiResponse<PaginatedResult<MessageDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResult<MessageDto>>>(
      API_ENDPOINTS.conversations.messages(conversationId),
      { params }
    );
  }

  sendMessage(conversationId: string, messageText: string): Observable<ApiResponse<MessageDto>> {
    return this.http.post<ApiResponse<MessageDto>>(
      API_ENDPOINTS.conversations.messages(conversationId),
      { messageText }
    );
  }

  editMessage(
    conversationId: string,
    messageId: string,
    messageText: string
  ): Observable<ApiResponse<MessageDto>> {
    return this.http.put<ApiResponse<MessageDto>>(
      API_ENDPOINTS.conversations.messageById(conversationId, messageId),
      { messageText }
    );
  }

  deleteMessage(conversationId: string, messageId: string): Observable<void> {
    return this.http.delete<void>(
      API_ENDPOINTS.conversations.messageById(conversationId, messageId)
    );
  }
}
