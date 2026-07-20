import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { PaymentStatus } from '../contracts/appointments.contracts';
import * as contract from '../contracts/appointments.contracts';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly endpoints = API_ENDPOINTS.appointments;

  create(request: contract.CreateAppointmentRequest): Observable<ApiResponse<string>> {
    return this.http
      .post<ApiResponse<string>>(this.endpoints.base, request);
  }

  private mapAppointment(dto: contract.AppointmentDto): contract.AppointmentDto {
    return {
      ...dto,
      paymentStatus: (dto as any).isPaid ? PaymentStatus.Paid : PaymentStatus.Unpaid,
    };
  }

  private mapAppointments(dtos: contract.AppointmentDto[]): contract.AppointmentDto[] {
    return dtos.map((d) => this.mapAppointment(d));
  }

  getById(id: string): Observable<ApiResponse<contract.AppointmentDto>> {
    return this.http
      .get<ApiResponse<contract.AppointmentDto>>(this.endpoints.byId(id))
      .pipe(map((res) => ({
        ...res,
        data: res.data ? this.mapAppointment(res.data) : res.data,
      })));
  }

  getMyAppointments(): Observable<ApiResponse<contract.AppointmentDto[]>> {
    return this.http
      .get<ApiResponse<contract.AppointmentDto[]>>(this.endpoints.myappointments)
      .pipe(map((res) => ({ ...res, data: res.data ? this.mapAppointments(res.data) : res.data })));
  }

  getAppointmentsBySpecialist(specialistId: string, pageSize = 100): Observable<ApiResponse<contract.AppointmentDto[]>> {
    const url = `${this.endpoints.bySpecialist(specialistId)}?pageSize=${pageSize}`;
    return this.http
      .get<ApiResponse<contract.AppointmentDto[]>>(url)
      .pipe(map((res) => ({ ...res, data: res.data ? this.mapAppointments(res.data) : res.data })));
  }

  getMySpecialistAppointments(pageNumber = 1, pageSize = 50): Observable<ApiResponse<contract.AppointmentDto[]>> {
    return this.http
      .get<ApiResponse<contract.AppointmentDto[]>>(`${this.endpoints.mySpecialistAppointments}?pageNumber=${pageNumber}&pageSize=${pageSize}`)
      .pipe(map((res) => ({ ...res, data: res.data ? this.mapAppointments(res.data) : res.data })));
  }

  getUpcomingAppointments(): Observable<ApiResponse<contract.AppointmentDto[]>> {
    return this.http
      .get<ApiResponse<contract.AppointmentDto[]>>(this.endpoints.upcoming)
      .pipe(map((res) => ({ ...res, data: res.data ? this.mapAppointments(res.data) : res.data })));
  }

  getStatusHistory(id: string): Observable<ApiResponse<contract.AppointmentStatusHistoryDto[]>> {
    return this.http
      .get<ApiResponse<contract.AppointmentStatusHistoryDto[]>>(this.endpoints.history(id));
  }

  confirm(id: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(this.endpoints.confirm(id), {})
      .pipe(map(() => undefined));
  }

  confirmPayment(id: string, paymentIntentId: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(this.endpoints.confirmPayment(id), { paymentIntentId })
      .pipe(map(() => undefined));
  }

  cancel(id: string, request: contract.CancelAppointmentRequest): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(this.endpoints.cancel(id), request)
      .pipe(map(() => undefined));
  }

  reschedule(id: string, request: contract.RescheduleAppointmentRequest): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(this.endpoints.reschedule(id), request)
      .pipe(map(() => undefined));
  }

  complete(id: string): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(this.endpoints.complete(id), {})
      .pipe(map(() => undefined));
  }

  reject(id: string, request: contract.RejectAppointmentRequest): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(this.endpoints.reject(id), request)
      .pipe(map(() => undefined));
  }

  updateNotes(id: string, request: contract.UpdateAppointmentNotesRequest): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(this.endpoints.notes(id), request)
      .pipe(map(() => undefined));
  }

  addReview(id: string, request: contract.AddReviewRequest): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(this.endpoints.reviews(id), request)
      .pipe(map(() => undefined));
  }

  getReminders(id: string): Observable<contract.ReminderDto[]> {
    return this.http
      .get<ApiResponse<contract.ReminderDto[]>>(this.endpoints.reminders(id))
      .pipe(map((res) => res.data ?? []));
  }

  addReminder(id: string, request: contract.AddReminderRequest): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(this.endpoints.reminders(id), request)
      .pipe(map((res) => res.data!));
  }

  deleteReminder(id: string, reminderId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(this.endpoints.reminderById(id, reminderId))
      .pipe(map(() => undefined));
  }

  getSummary(id: string): Observable<ApiResponse<contract.SessionSummaryDto>> {
    return this.http
      .get<ApiResponse<contract.SessionSummaryDto>>(API_ENDPOINTS.ai.summary(id));
  }

  getSpecialistAvailability(specialistId: string): Observable<ApiResponse<contract.AvailabilitySlotDto[]>> {
    return this.http
      .get<ApiResponse<contract.AvailabilitySlotDto[]>>(API_ENDPOINTS.specialists.availabilityFor(specialistId));
  }
}
