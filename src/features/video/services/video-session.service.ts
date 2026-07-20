import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { VideoSessionDto, AgoraTokenResponse, StartSessionResponse, EndSessionResponse, StartRecordingResponse, StopRecordingResponse, RecordingInfoDto } from '../models/video-session.model';
import { ApiResponse } from '@core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class VideoSessionService {
  private readonly http = inject(HttpClient);

  getSession(sessionId: string): Observable<ApiResponse<VideoSessionDto>> {
    return this.http.get<ApiResponse<VideoSessionDto>>(API_ENDPOINTS.video.sessionById(sessionId));
  }

  generateToken(appointmentId: string): Observable<ApiResponse<AgoraTokenResponse>> {
    return this.http.post<ApiResponse<AgoraTokenResponse>>(API_ENDPOINTS.video.generateToken, { appointmentId });
  }

  startSession(sessionId: string): Observable<ApiResponse<StartSessionResponse>> {
    return this.http.post<ApiResponse<StartSessionResponse>>(API_ENDPOINTS.video.start(sessionId), {});
  }

  endSession(sessionId: string): Observable<ApiResponse<EndSessionResponse>> {
    return this.http.post<ApiResponse<EndSessionResponse>>(API_ENDPOINTS.video.end(sessionId), {});
  }

  leaveSession(sessionId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_ENDPOINTS.video.leave(sessionId), {});
  }

  finishConsultation(sessionId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_ENDPOINTS.video.finishConsultation(sessionId), {});
  }

  startRecording(sessionId: string): Observable<ApiResponse<StartRecordingResponse>> {
    return this.http.post<ApiResponse<StartRecordingResponse>>(API_ENDPOINTS.video.recordingStart(sessionId), {});
  }

  stopRecording(sessionId: string): Observable<ApiResponse<StopRecordingResponse>> {
    return this.http.post<ApiResponse<StopRecordingResponse>>(API_ENDPOINTS.video.recordingStop(sessionId), {});
  }

  getRecordingInfo(sessionId: string): Observable<ApiResponse<RecordingInfoDto>> {
    return this.http.get<ApiResponse<RecordingInfoDto>>(API_ENDPOINTS.video.recordingInfo(sessionId));
  }

  webhook(data: any): Observable<void> {
    return this.http.post<void>(API_ENDPOINTS.video.webhook, data);
  }
}
