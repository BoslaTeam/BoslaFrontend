import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { ApiResponse } from '../../../core/models/api-response.model';
import { PaginatedResponse } from '../../../core/models/paginated-response.model';
import { AppointmentDto } from '../contracts/appointments.contracts';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private http = inject(HttpClient);

  getMyAppointments(page: number = 1, size: number = 10): Observable<ApiResponse<PaginatedResponse<AppointmentDto>>> {
    return this.http.get<ApiResponse<PaginatedResponse<AppointmentDto>>>(`${API_ENDPOINTS.appointments.base}/my-appointments?pageNumber=${page}&pageSize=${size}`);
  }

  getAppointmentById(id: string): Observable<ApiResponse<AppointmentDto>> {
    return this.http.get<ApiResponse<AppointmentDto>>(`${API_ENDPOINTS.appointments.base}/${id}`);
  }

  cancelAppointment(id: string): Observable<ApiResponse<boolean>> {
    return this.http.put<ApiResponse<boolean>>(`${API_ENDPOINTS.appointments.base}/${id}/cancel`, {});
  }
}
