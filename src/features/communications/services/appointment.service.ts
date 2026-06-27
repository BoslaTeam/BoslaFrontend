import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { AppointmentDto } from '../models/chat.model';
import { ApiResponse } from '@core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly http = inject(HttpClient);

  getById(appointmentId: string): Observable<ApiResponse<AppointmentDto>> {
    return this.http.get<ApiResponse<AppointmentDto>>(
      API_ENDPOINTS.appointments.byId(appointmentId)
    );
  }
}
