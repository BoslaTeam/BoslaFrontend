import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AUTH_CONFIG } from '../config/auth.config';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { CurrentUser } from '@features/auth/models/current-user.model';
import { UserRole } from '@core/enums/user-role.enum';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    country: string;
    role: string;
}

export interface AuthTokensResponse {
    accessToken: string;
    refreshToken: string;
    expiresOnUtc: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);
    private readonly tokenService = inject(TokenService);
    private readonly storage = inject(StorageService);

    private readonly _currentUser = signal<CurrentUser | null>(this.restoreUser());

    readonly currentUser = this._currentUser.asReadonly();
    readonly isAuthenticated = computed(() => !!this._currentUser());
    readonly userRole = computed(() => this._currentUser()?.role ?? null);

    login(payload: LoginPayload): Observable<ApiResponse<AuthTokensResponse>> {
        return this.http
            .post<ApiResponse<AuthTokensResponse>>(API_ENDPOINTS.auth.login, payload)
            .pipe(tap((res) => { if (res.data) this.setSession(res.data); }));
    }

    register(payload: any): Observable<ApiResponse<AuthTokensResponse>> {
        return this.http
            .post<ApiResponse<AuthTokensResponse>>(API_ENDPOINTS.auth.register, payload)
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data);
                }
            }));
    }

    googleLogin(payload: any): Observable<ApiResponse<AuthTokensResponse>> {
        return this.http
            .post<ApiResponse<AuthTokensResponse>>(API_ENDPOINTS.auth.googleLogin, payload)
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data);
                }
            }));
    }

    forgotPassword(payload: any): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(API_ENDPOINTS.auth.forgotPassword, payload);
    }

    resetPassword(payload: any): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(API_ENDPOINTS.auth.resetPassword, payload);
    }

    confirmEmail(payload: any): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(API_ENDPOINTS.auth.confirmEmail, payload);
    }

    resendConfirmationEmail(payload: any): Observable<ApiResponse<boolean>> {
        return this.http.post<ApiResponse<boolean>>(API_ENDPOINTS.auth.resendConfirmationEmail, payload);
    }

    refreshToken(): Observable<ApiResponse<AuthTokensResponse>> {
        const refreshToken = this.tokenService.getRefreshToken();
        const accessToken = this.tokenService.getAccessToken();
        return this.http
            .post<ApiResponse<AuthTokensResponse>>(API_ENDPOINTS.auth.refresh, { accessToken, refreshToken })
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data);
                }
            }));
    }

    logout(): void {
        this.http.post(API_ENDPOINTS.auth.logout, {}).subscribe({
            complete: () => this.clearSession(),
            error: () => this.clearSession(),
        });
    }

    setSession(data: AuthTokensResponse): void {
        this.tokenService.setTokens(data.accessToken, data.refreshToken);
        
        let user: CurrentUser | null = null;
        if (data.accessToken) {
            const decoded = this.tokenService.decodeToken(data.accessToken);
            if (decoded) {
                let roleClaim = decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
                let parsedRole = 0;
                
                if (Array.isArray(roleClaim)) {
                    if (roleClaim.includes('Admin') || roleClaim.includes('2')) parsedRole = 2;
                    else if (roleClaim.includes('Specialist') || roleClaim.includes('1')) parsedRole = 1;
                } else if (typeof roleClaim === 'string') {
                    if (roleClaim.toLowerCase() === 'admin') parsedRole = 2;
                    else if (roleClaim.toLowerCase() === 'specialist') parsedRole = 1;
                    else if (!isNaN(Number(roleClaim))) parsedRole = Number(roleClaim);
                } else if (typeof roleClaim === 'number') {
                    parsedRole = roleClaim;
                }

                user = {
                    id: decoded.sub || decoded['nameid'] || '',
                    email: decoded['email'] as string || '',
                    fullName: decoded['name'] as string || decoded['unique_name'] as string || '',
                    role: parsedRole,
                    avatarUrl: decoded['avatar'] || decoded['picture'] || null
                } as CurrentUser;
            }
        }

        if (user) {
            this.storage.setJson(STORAGE_KEYS.currentUser, user);
            this._currentUser.set(user);
        } else {
            this._currentUser.set({ id: '', email: '', fullName: '', role: 0 } as CurrentUser);
        }
    }

    updateAvatar(avatarUrl: string): void {
        const user = this._currentUser();
        if (user) {
            const updatedUser = { ...user, avatarUrl };
            this._currentUser.set(updatedUser);
            this.storage.setJson(STORAGE_KEYS.currentUser, updatedUser);
        }
    }

    clearSession(): void {
        this.tokenService.clearTokens();
        this.storage.remove(STORAGE_KEYS.currentUser);
        this._currentUser.set(null);
        this.router.navigateByUrl(AUTH_CONFIG.loginRoute);
    }

    hasRole(...roles: UserRole[]): boolean {
        const role = this.userRole();
        return role !== null && role !== undefined && roles.includes(role);
    }

    private restoreUser(): CurrentUser | null {
        const hasRefreshToken = !!this.tokenService.getRefreshToken();
        if (!hasRefreshToken) return null;

        const user = this.storage.getJson<CurrentUser>(STORAGE_KEYS.currentUser);
        
        if (user && user.role !== undefined) {
            user.role = Number(user.role) as UserRole;
        }

        return user;
    }
}