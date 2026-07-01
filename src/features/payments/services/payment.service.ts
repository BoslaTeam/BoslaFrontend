import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { PaymentResponseDto, InitiatePaymentRequest } from '../contracts/payment.contracts';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  initiate(appointmentId: string, currency = 'usd'): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.post<ApiResponse<PaymentResponseDto>>(API_ENDPOINTS.payments.base, { appointmentId, currency } as InitiatePaymentRequest);
  }

  getById(id: string): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.get<ApiResponse<PaymentResponseDto>>(API_ENDPOINTS.payments.byId(id));
  }

  getByAppointment(appointmentId: string): Observable<ApiResponse<PaymentResponseDto>> {
    return this.http.get<ApiResponse<PaymentResponseDto>>(`${API_ENDPOINTS.payments.base}/appointments/${appointmentId}/payment`);
  }

  getMyPayments(): Observable<ApiResponse<PaymentResponseDto[]>> {
    return this.http.get<ApiResponse<PaymentResponseDto[]>>(`${API_ENDPOINTS.payments.base}/me`);
  }
}
