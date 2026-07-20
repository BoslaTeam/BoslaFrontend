import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import {
  WalletDto,
  WithdrawalDto,
  WithdrawRequestDto,
  AdminWithdrawalListDto,
  AdminWithdrawalDetailDto,
  AdminWithdrawActionDto,
} from '../contracts/withdrawal.contracts';

@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  private readonly http = inject(HttpClient);

  // Specialist endpoints

  getWallet(): Observable<WalletDto> {
    return this.http
      .get<ApiResponse<WalletDto>>(API_ENDPOINTS.withdrawals.wallet)
      .pipe(map((res) => res.data!));
  }

  requestWithdrawal(payload: WithdrawRequestDto): Observable<WithdrawalDto> {
    return this.http
      .post<ApiResponse<WithdrawalDto>>(API_ENDPOINTS.withdrawals.request, payload)
      .pipe(map((res) => res.data!));
  }

  getHistory(): Observable<WithdrawalDto[]> {
    return this.http
      .get<ApiResponse<WithdrawalDto[]>>(API_ENDPOINTS.withdrawals.history)
      .pipe(map((res) => res.data!));
  }

  // Admin endpoints

  getPendingWithdrawals(): Observable<AdminWithdrawalListDto[]> {
    return this.http
      .get<ApiResponse<AdminWithdrawalListDto[]>>(API_ENDPOINTS.admin.withdrawalsPending)
      .pipe(map((res) => res.data!));
  }

  getAllWithdrawals(status?: string): Observable<AdminWithdrawalListDto[]> {
    const params = status ? { status } : undefined;
    return this.http
      .get<ApiResponse<AdminWithdrawalListDto[]>>(API_ENDPOINTS.admin.withdrawals, { params })
      .pipe(map((res) => res.data!));
  }

  getWithdrawalDetail(id: string): Observable<AdminWithdrawalDetailDto> {
    return this.http
      .get<ApiResponse<AdminWithdrawalDetailDto>>(API_ENDPOINTS.admin.withdrawalDetail(id))
      .pipe(map((res) => res.data!));
  }

  approveWithdrawal(id: string, payload?: AdminWithdrawActionDto): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.approveWithdrawal(id), payload ?? {})
      .pipe(map((res) => res.success));
  }

  rejectWithdrawal(id: string, payload?: AdminWithdrawActionDto): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.rejectWithdrawal(id), payload ?? {})
      .pipe(map((res) => res.success));
  }

  completeWithdrawal(id: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(API_ENDPOINTS.admin.completeWithdrawal(id), {})
      .pipe(map((res) => res.success));
  }
}
