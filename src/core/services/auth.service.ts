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
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
}

export interface AuthTokensResponse {
    accessToken: string;
    refreshToken: string;
    user: CurrentUser;
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
            .pipe(tap((res) => this.setSession(res.data)));
    }

    register(payload: RegisterPayload): Observable<ApiResponse<AuthTokensResponse>> {
        return this.http
            .post<ApiResponse<AuthTokensResponse>>(API_ENDPOINTS.auth.register, payload)
            .pipe(tap((res) => this.setSession(res.data)));
    }

    refreshToken(): Observable<ApiResponse<AuthTokensResponse>> {
        const refreshToken = this.tokenService.getRefreshToken();
        return this.http
            .post<ApiResponse<AuthTokensResponse>>(API_ENDPOINTS.auth.refresh, { refreshToken })
            .pipe(tap((res) => this.setSession(res.data)));
    }

    logout(): void {
        this.http.post(API_ENDPOINTS.auth.logout, {}).subscribe({
            complete: () => this.clearSession(),
            error: () => this.clearSession(),
        });
    }

    setSession(data: AuthTokensResponse): void {
        this.tokenService.setTokens(data.accessToken, data.refreshToken);
        this.storage.setJson(STORAGE_KEYS.currentUser, data.user);
        this._currentUser.set(data.user);
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