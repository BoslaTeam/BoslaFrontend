import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ConversationDto, ApiResponse, PaginatedResult } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private readonly http = inject(HttpClient);

  getConversations(pageNumber: number, pageSize: number): Observable<ApiResponse<PaginatedResult<ConversationDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ApiResponse<PaginatedResult<ConversationDto>>>(
      API_ENDPOINTS.conversations.base,
      { params }
    );
  }

  getConversationById(conversationId: string): Observable<ApiResponse<ConversationDto>> {
    return this.http.get<ApiResponse<ConversationDto>>(
      API_ENDPOINTS.conversations.byId(conversationId)
    );
  }
}
