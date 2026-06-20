import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token';
import { ApiResponse } from '../models/api-response.model';
import { 
  LoginRequest, 
  TokenResponse, 
  RegisterRequest, 
  RegisterResponse, 
  ConfirmEmailRequest,
  ResendConfirmationEmailRequest,
  GoogleLoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../../features/auth/contracts/auth.contracts';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  // Signal for global authentication state
  readonly isAuthenticated = signal<boolean>(this.tokenService.hasValidAccessToken());

  login(data: LoginRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.baseUrl}/login`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.setAccessToken(response.data.accessToken);
          this.tokenService.setRefreshToken(response.data.refreshToken);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<ApiResponse<RegisterResponse>> {
    return this.http.post<ApiResponse<RegisterResponse>>(`${this.baseUrl}/register`, data);
  }

  confirmEmail(data: ConfirmEmailRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/confirm-email`, data);
  }

  resendConfirmationEmail(data: ResendConfirmationEmailRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/resend-confirmation-email`, data);
  }

  googleLogin(data: GoogleLoginRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.baseUrl}/google-login`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.setAccessToken(response.data.accessToken);
          this.tokenService.setRefreshToken(response.data.refreshToken);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  refresh(data: RefreshTokenRequest): Observable<ApiResponse<TokenResponse>> {
    return this.http.post<ApiResponse<TokenResponse>>(`${this.baseUrl}/refresh`, data).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.setAccessToken(response.data.accessToken);
          this.tokenService.setRefreshToken(response.data.refreshToken);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clearTokens();
        this.isAuthenticated.set(false);
      })
    );
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.baseUrl}/reset-password`, data);
  }
}
