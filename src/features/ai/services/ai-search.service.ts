import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { SpecialistListItemDto } from '@features/specialists/contracts/specialist.contracts';
import {
  AiSearchRequest,
  AiSearchResponse,
  SearchHistoryItem,
  SearchFeedbackRequest,
  ChatRequest,
  ChatResponse,
} from '../contracts/ai-search.contracts';

@Injectable({ providedIn: 'root' })
export class AiSearchService {
  private readonly http = inject(HttpClient);

  search(req: AiSearchRequest): Observable<AiSearchResponse> {
    return this.http
      .post<ApiResponse<AiSearchResponse>>(API_ENDPOINTS.ai.search, req)
      .pipe(map((res) => res.data!));
  }

  getHistory(): Observable<SearchHistoryItem[]> {
    return this.http
      .get<ApiResponse<SearchHistoryItem[]>>(API_ENDPOINTS.ai.searchHistory)
      .pipe(map((res) => res.data!));
  }

  recordFeedback(id: string, feedback: SearchFeedbackRequest): Observable<void> {
    return this.http
      .post<void>(API_ENDPOINTS.ai.searchFeedback(id), feedback);
  }

  chat(req: ChatRequest): Observable<ChatResponse> {
    return this.http
      .post<ApiResponse<ChatResponse>>(API_ENDPOINTS.ai.chat, req)
      .pipe(map((res) => res.data!));
  }

  getRecommendations(topK = 6): Observable<SpecialistListItemDto[]> {
    let params = new HttpParams().set('topK', topK.toString());
    return this.http
      .get<ApiResponse<SpecialistListItemDto[]>>(API_ENDPOINTS.ai.recommendations, { params })
      .pipe(map((res) => res.data!));
  }
}
