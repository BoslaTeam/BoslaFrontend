import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';
import { PaginationRequest } from '@core/models/pagination.model';
import {
  AdminDashboardDto,
  AdminUserDto,
  AdminUserDetailDto,
  PendingSpecialistDto,
  AdminSpecialistDetailDto,
  AdminAppointmentDto,
  AuditLogDto,
  EmbeddingsStatusDto,
} from '../contracts/admin.contracts';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  // ── Dashboard ──

  getDashboardStats(): Observable<AdminDashboardDto> {
    return this.http
      .get<ApiResponse<AdminDashboardDto>>(API_ENDPOINTS.admin.dashboard)
      .pipe(map((res) => res.data!));
  }

  // ── Users Management ──

  getUsers(params: PaginationRequest & { role?: number; isActive?: boolean }): Observable<ApiResponse<PaginatedResponse<AdminUserDto>>> {
    let httpParams = this.buildPaginationParams(params);
    if (params.role !== undefined) httpParams = httpParams.set('role', params.role.toString());
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());

    return this.http.get<ApiResponse<PaginatedResponse<AdminUserDto>>>(
      API_ENDPOINTS.admin.users,
      { params: httpParams }
    );
  }

  getUserDetail(id: string): Observable<AdminUserDetailDto> {
    return this.http
      .get<ApiResponse<AdminUserDetailDto>>(API_ENDPOINTS.admin.userDetail(id))
      .pipe(map((res) => res.data!));
  }

  createUser(payload: any): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.users, payload)
      .pipe(map((res) => res.success));
  }

  updateUser(id: string, payload: any): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(API_ENDPOINTS.admin.userDetail(id), payload)
      .pipe(map((res) => res.success));
  }

  deactivateUser(id: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.deactivateUser(id), {})
      .pipe(map((res) => res.data!));
  }

  reactivateUser(id: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.reactivateUser(id), {})
      .pipe(map((res) => res.data!));
  }

  // ── Specialists Management ──

  getPendingSpecialists(params: PaginationRequest): Observable<ApiResponse<PaginatedResponse<PendingSpecialistDto>>> {
    return this.http.get<ApiResponse<PaginatedResponse<PendingSpecialistDto>>>(
      API_ENDPOINTS.admin.pendingSpecialists,
      { params: this.buildPaginationParams(params) }
    );
  }

  getSpecialistDetail(id: string): Observable<AdminSpecialistDetailDto> {
    return this.http
      .get<ApiResponse<AdminSpecialistDetailDto>>(API_ENDPOINTS.admin.specialistDetail(id))
      .pipe(map((res) => res.data!));
  }

  verifySpecialist(id: string, payload: { isApproved: boolean; notes?: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.verifySpecialist(id), payload)
      .pipe(map((res) => res.data!));
  }

  // ── Appointments ──

  getAppointments(params: PaginationRequest & { status?: number }): Observable<ApiResponse<PaginatedResponse<AdminAppointmentDto>>> {
    let httpParams = this.buildPaginationParams(params);
    if (params.status !== undefined) httpParams = httpParams.set('status', params.status.toString());

    return this.http.get<ApiResponse<PaginatedResponse<AdminAppointmentDto>>>(
      API_ENDPOINTS.admin.appointments,
      { params: httpParams }
    );
  }

  // ── Audit Logs ──

  getAuditLogs(params: PaginationRequest): Observable<ApiResponse<PaginatedResponse<AuditLogDto>>> {
    return this.http.get<ApiResponse<PaginatedResponse<AuditLogDto>>>(
      API_ENDPOINTS.admin.auditLogs,
      { params: this.buildPaginationParams(params) }
    );
  }

  // ── AI Embeddings ──

  getEmbeddingsStatus(): Observable<EmbeddingsStatusDto> {
    return this.http
      .get<ApiResponse<EmbeddingsStatusDto>>(API_ENDPOINTS.admin.embeddingsStatus)
      .pipe(map((res) => res.data!));
  }

  rebuildEmbeddings(): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.embeddingsRebuild, {})
      .pipe(map((res) => res.data!));
  }

  // ── Helpers ──

  private buildPaginationParams(params: PaginationRequest): HttpParams {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDescending !== undefined) httpParams = httpParams.set('sortDescending', params.sortDescending.toString());

    return httpParams;
  }
}
