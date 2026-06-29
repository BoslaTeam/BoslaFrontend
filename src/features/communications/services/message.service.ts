import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { MessageDto } from '../models/chat.model';
import { ApiResponse } from '@core/models/api-response.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly http = inject(HttpClient);

  getMessages(
    conversationId: string,
    pageNumber: number,
    pageSize: number
  ): Observable<ApiResponse<PaginatedResponse<MessageDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResponse<MessageDto>>>(
      API_ENDPOINTS.conversations.messages(conversationId),
      { params }
    );
  }

  sendMessage(conversationId: string, messageText: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      API_ENDPOINTS.conversations.messages(conversationId),
      { messageText }
    );
  }

  editMessage(
    conversationId: string,
    messageId: string,
    messageText: string
  ): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(
      API_ENDPOINTS.conversations.messageById(conversationId, messageId),
      { messageText }
    );
  }

  deleteMessage(conversationId: string, messageId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      API_ENDPOINTS.conversations.messageById(conversationId, messageId)
    );
  }
}
