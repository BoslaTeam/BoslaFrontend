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
  AdminSpecialistListItemDto,
  AdminSpecialistDetailDto,
  AdminAppointmentDto,
  AdminAppointmentDetailDto,
  AdminPaymentDto,
  AdminPaymentDetailDto,
  AuditLogDto,
  EmbeddingsStatusDto,
  CreateSpecialistRequest,
} from '../contracts/admin.contracts';
import { PortfolioItemDto, AdminReviewPortfolioRequest } from '@features/specialists/contracts/specialist-portfolio.contract';

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

  getAllSpecialists(params: PaginationRequest & { verificationStatus?: string }): Observable<ApiResponse<PaginatedResponse<AdminSpecialistListItemDto>>> {
    let httpParams = this.buildPaginationParams(params);
    if (params.verificationStatus) httpParams = httpParams.set('verificationStatus', params.verificationStatus);

    return this.http.get<ApiResponse<PaginatedResponse<AdminSpecialistListItemDto>>>(
      API_ENDPOINTS.admin.specialists,
      { params: httpParams }
    );
  }

  getSpecialistDetail(id: string): Observable<AdminSpecialistDetailDto> {
    return this.http
      .get<ApiResponse<AdminSpecialistDetailDto>>(API_ENDPOINTS.admin.specialistDetail(id))
      .pipe(map((res) => res.data!));
  }

  verifySpecialist(id: string, payload: { isVerified: boolean; adminNotes?: string }): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.verifySpecialist(id), payload)
      .pipe(map((res) => res.data!));
  }

  // ── Lookups (Expertise, Skills, Tools) ──

  getIndustryList(): Observable<{ id: string; name: string }[]> {
    return this.http.get<ApiResponse<{ id: string; name: string }[]>>(API_ENDPOINTS.admin.industries)
      .pipe(map((res) => res.data!));
  }

  createIndustry(name: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(API_ENDPOINTS.admin.industries, { name })
      .pipe(map((res) => res.data!));
  }

  updateIndustry(id: string, name: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.admin.industryById(id), { name })
      .pipe(map((res) => res.success));
  }

  deleteIndustry(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.admin.industryById(id))
      .pipe(map((res) => res.success));
  }

  getExpertiseList(): Observable<{ id: string; name: string }[]> {
    return this.http.get<ApiResponse<{ id: string; name: string }[]>>(API_ENDPOINTS.admin.expertise)
      .pipe(map((res) => res.data!));
  }

  createExpertise(name: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(API_ENDPOINTS.admin.expertise, { name })
      .pipe(map((res) => res.data!));
  }

  updateExpertise(id: string, name: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.admin.expertiseById(id), { name })
      .pipe(map((res) => res.success));
  }

  deleteExpertise(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.admin.expertiseById(id))
      .pipe(map((res) => res.success));
  }

  getSkillList(): Observable<{ id: string; name: string }[]> {
    return this.http.get<ApiResponse<{ id: string; name: string }[]>>(API_ENDPOINTS.admin.skills)
      .pipe(map((res) => res.data!));
  }

  createSkill(name: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(API_ENDPOINTS.admin.skills, { name })
      .pipe(map((res) => res.data!));
  }

  updateSkill(id: string, name: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.admin.skillById(id), { name })
      .pipe(map((res) => res.success));
  }

  deleteSkill(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.admin.skillById(id))
      .pipe(map((res) => res.success));
  }

  getToolList(): Observable<{ id: string; name: string }[]> {
    return this.http.get<ApiResponse<{ id: string; name: string }[]>>(API_ENDPOINTS.admin.tools)
      .pipe(map((res) => res.data!));
  }

  createTool(name: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(API_ENDPOINTS.admin.tools, { name })
      .pipe(map((res) => res.data!));
  }

  updateTool(id: string, name: string): Observable<boolean> {
    return this.http.put<ApiResponse<boolean>>(API_ENDPOINTS.admin.toolById(id), { name })
      .pipe(map((res) => res.success));
  }

  deleteTool(id: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(API_ENDPOINTS.admin.toolById(id))
      .pipe(map((res) => res.success));
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

  getAppointmentDetail(id: string): Observable<AdminAppointmentDetailDto> {
    return this.http
      .get<ApiResponse<AdminAppointmentDetailDto>>(API_ENDPOINTS.admin.appointmentDetail(id))
      .pipe(map((res) => res.data!));
  }

  cancelAppointment(id: string, reason: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.cancelAppointment(id), { reason })
      .pipe(map((res) => res.data ?? res.success));
  }

  confirmAppointment(id: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.confirmAppointment(id), {})
      .pipe(map((res) => res.success));
  }

  completeAppointment(id: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.completeAppointment(id), {})
      .pipe(map((res) => res.success));
  }

  // ── Payments ──

  getPayments(params: PaginationRequest & { status?: string }): Observable<ApiResponse<PaginatedResponse<AdminPaymentDto>>> {
    let httpParams = this.buildPaginationParams(params);
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<ApiResponse<PaginatedResponse<AdminPaymentDto>>>(
      API_ENDPOINTS.admin.payments,
      { params: httpParams }
    );
  }

  getPaymentDetail(id: string): Observable<AdminPaymentDetailDto> {
    return this.http
      .get<ApiResponse<AdminPaymentDetailDto>>(API_ENDPOINTS.admin.paymentDetail(id))
      .pipe(map((res) => res.data!));
  }

  refundPayment(id: string, reason?: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.refundPayment(id), { reason })
      .pipe(map((res) => res.success));
  }

  // ── Disputes ──

  getAllDisputes(status?: string): Observable<import('@features/payments/contracts/payment.contracts').ComplaintListItemDto[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http
      .get<ApiResponse<import('@features/payments/contracts/payment.contracts').ComplaintListItemDto[]>>(API_ENDPOINTS.admin.paymentDisputes, { params })
      .pipe(map((res) => res.data!));
  }

  getDisputeDetail(id: string): Observable<import('@features/payments/contracts/payment.contracts').ComplaintDetailDto> {
    return this.http
      .get<ApiResponse<import('@features/payments/contracts/payment.contracts').ComplaintDetailDto>>(API_ENDPOINTS.admin.paymentDisputeDetail(id))
      .pipe(map((res) => res.data!));
  }

  resolveDispute(id: string, request: import('@features/admin/contracts/admin.contracts').ResolveDisputeRequest): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.resolveDispute(id), request)
      .pipe(map((res) => res.success));
  }

  updateSpecialistStatus(id: string, status: string): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(API_ENDPOINTS.admin.specialistStatus(id), { status })
      .pipe(map((res) => res.success));
  }

  createSpecialist(payload: CreateSpecialistRequest): Observable<string> {
    return this.http
      .post<ApiResponse<string>>(API_ENDPOINTS.admin.createSpecialist, payload)
      .pipe(map((res) => res.data!));
  }

  updateSpecialist(id: string, payload: any): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(API_ENDPOINTS.admin.updateSpecialist(id), payload)
      .pipe(map((res) => res.success));
  }

  updateUserRoles(id: string, roles: string[]): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(API_ENDPOINTS.admin.userRoles(id), { roles })
      .pipe(map((res) => res.success));
  }

  // ── Audit Logs ──

  getAuditLogById(id: string): Observable<AuditLogDto> {
    return this.http
      .get<ApiResponse<AuditLogDto>>(API_ENDPOINTS.admin.auditLogById(id))
      .pipe(map((res) => res.data!));
  }

  getAuditLogs(params: PaginationRequest & {
    action?: string;
    entityType?: string;
    from?: string;
    to?: string;
  }): Observable<ApiResponse<PaginatedResponse<AuditLogDto>>> {
    let httpParams = this.buildPaginationParams(params);
    if (params.action) httpParams = httpParams.set('action', params.action);
    if (params.entityType) httpParams = httpParams.set('entityType', params.entityType);
    if (params.from) httpParams = httpParams.set('from', params.from);
    if (params.to) httpParams = httpParams.set('to', params.to);

    return this.http.get<ApiResponse<PaginatedResponse<AuditLogDto>>>(
      API_ENDPOINTS.admin.auditLogs,
      { params: httpParams }
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

  // ── Portfolio Review ──

  getSpecialistPortfolio(specialistId: string): Observable<PortfolioItemDto[]> {
    return this.http
      .get<ApiResponse<PortfolioItemDto[]>>(API_ENDPOINTS.portfolio.adminBySpecialist(specialistId))
      .pipe(map((res) => res.data!));
  }

  approvePortfolioItem(specialistId: string, itemId: string, request: AdminReviewPortfolioRequest): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(API_ENDPOINTS.portfolio.adminApprove(specialistId, itemId), request)
      .pipe(map((res) => res.data!));
  }

  rejectPortfolioItem(specialistId: string, itemId: string, request: AdminReviewPortfolioRequest): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(API_ENDPOINTS.portfolio.adminReject(specialistId, itemId), request)
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
