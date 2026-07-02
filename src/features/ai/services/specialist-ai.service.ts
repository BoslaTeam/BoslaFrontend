import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import {
  SmartRepliesRequest,
  SmartRepliesResponse,
  SessionPrepDto,
  DashboardInsightsDto,
} from '../contracts/specialist-ai.contracts';

@Injectable({ providedIn: 'root' })
export class SpecialistAiService {
  private readonly http = inject(HttpClient);

  /** GET smart reply suggestions for a conversation (POST because we send a body) */
  getSmartReplies(conversationId: string): Observable<SmartRepliesResponse> {
    const body: SmartRepliesRequest = { conversationId };
    return this.http
      .post<ApiResponse<SmartRepliesResponse>>(
        API_ENDPOINTS.ai.specialist.smartReplies,
        body
      )
      .pipe(map((res) => res.data!));
  }

  /** GET session prep info before joining a video call */
  getSessionPrep(appointmentId: string): Observable<SessionPrepDto> {
    return this.http
      .get<ApiResponse<SessionPrepDto>>(
        API_ENDPOINTS.ai.specialist.sessionPrep(appointmentId)
      )
      .pipe(map((res) => res.data!));
  }

  /** GET dashboard AI insights for the specialist */
  getDashboardInsights(): Observable<DashboardInsightsDto> {
    return this.http
      .get<ApiResponse<DashboardInsightsDto>>(
        API_ENDPOINTS.ai.specialist.dashboardInsights
      )
      .pipe(map((res) => res.data!));
  }
}
