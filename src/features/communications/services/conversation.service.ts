import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ConversationDto } from '../models/chat.model';
import { ApiResponse } from '@core/models/api-response.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly http = inject(HttpClient);

  getConversations(pageNumber: number, pageSize: number): Observable<ApiResponse<PaginatedResponse<ConversationDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResponse<ConversationDto>>>(
      API_ENDPOINTS.conversations.base,
      { params }
    );
  }

  getConversationById(conversationId: string): Observable<ApiResponse<ConversationDto>> {
    return this.http.get<ApiResponse<ConversationDto>>(
      API_ENDPOINTS.conversations.byId(conversationId)
    );
  }

  create(appointmentId: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      API_ENDPOINTS.conversations.base,
      { appointmentId }
    );
  }
}
