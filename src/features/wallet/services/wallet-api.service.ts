import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { ApiResponse } from '@core/models/api-response.model';
import { WalletResponseDto, TransactionDto, AdminWalletStatsDto } from '../contracts/wallet.contracts';

@Injectable({ providedIn: 'root' })
export class WalletApiService {
  private readonly http = inject(HttpClient);

  getMyWallet(): Observable<WalletResponseDto> {
    return this.http.get<ApiResponse<WalletResponseDto>>(API_ENDPOINTS.wallet.me).pipe(map(r => r.data!));
  }

  getMyTransactions(page = 1, pageSize = 20): Observable<TransactionDto[]> {
    return this.http.get<ApiResponse<TransactionDto[]>>(API_ENDPOINTS.wallet.myTransactions, { params: { page, pageSize } as any }).pipe(map(r => r.data!));
  }

  // Admin
  getAdminWalletStats(): Observable<AdminWalletStatsDto> {
    return this.http.get<ApiResponse<AdminWalletStatsDto>>(API_ENDPOINTS.admin.walletStats).pipe(map(r => r.data!));
  }

  getAdminWallet(): Observable<WalletResponseDto> {
    return this.http.get<ApiResponse<WalletResponseDto>>(API_ENDPOINTS.admin.walletMe).pipe(map(r => r.data!));
  }

  getAllTransactions(page = 1, pageSize = 50): Observable<TransactionDto[]> {
    return this.http.get<ApiResponse<TransactionDto[]>>(API_ENDPOINTS.admin.walletTransactions, { params: { page, pageSize } as any }).pipe(map(r => r.data!));
  }
}
