import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Injector, computed, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';

import { ApiResponse } from '../models/api-response.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { StorageService } from './storage.service';
import { TokenService } from './token.service';
import { NavigationService } from '../navigation/navigation.service';
import { CurrentUser } from '@features/auth/models/current-user.model';
import { UserRole } from '@core/enums/user-role.enum';
import { RegisterRequest } from '@features/auth/contracts/auth.contracts';

export interface LoginPayload {
    email: string;
    password: string;
}
export interface AuthTokensResponse {
    accessToken: string;
    refreshToken: string;
    expiresOnUtc: string;
}

export type SpecialistStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | null;

const STATUS_MAP: Record<number, Exclude<SpecialistStatus, null>> = {
    0: 'Draft',
    1: 'Pending',
    2: 'Approved',
    3: 'Rejected',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly tokenService = inject(TokenService);
    private readonly storage = inject(StorageService);
    private readonly injector = inject(Injector);

    private readonly _currentUser = signal<CurrentUser | null>(this.restoreUser());
    private readonly _specialistStatus = signal<SpecialistStatus>(null);

    readonly currentUser = this._currentUser.asReadonly();
    readonly isAuthenticated = computed(() => !!this._currentUser());
    readonly roles = computed(() => this._currentUser()?.roles ?? []);
    readonly specialistStatus = this._specialistStatus.asReadonly();

    readonly userRole = computed(() => {
        const roles = this._currentUser()?.roles;
        if (!roles || roles.length === 0) return null;
        if (roles.includes(UserRole.Admin)) return UserRole.Admin;
        if (roles.includes(UserRole.Specialist)) return UserRole.Specialist;
        return UserRole.User;
    });

    readonly needsSpecialistOnboarding = computed(() => {
        const role = this.userRole();
        const status = this._specialistStatus();
        return role === UserRole.Specialist && status === 'Draft';
    });

    login(payload: LoginPayload): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
        return this.http
            .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(API_ENDPOINTS.auth.login, payload)
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data.accessToken, res.data.refreshToken);
                }
            }));
    }

    register(payload: RegisterRequest): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
        return this.http
            .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(API_ENDPOINTS.auth.register, payload)
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data.accessToken, res.data.refreshToken);
                }
            }));
    }

    googleLogin(payload: any): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
        return this.http
            .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(API_ENDPOINTS.auth.googleLogin, payload)
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data.accessToken, res.data.refreshToken);
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

    refreshToken(): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
        const refreshToken = this.tokenService.getRefreshToken();
        return this.http
            .post<ApiResponse<{ accessToken: string; refreshToken: string }>>(API_ENDPOINTS.auth.refresh, { refreshToken })
            .pipe(tap((res) => {
                if (res.data) {
                    this.setSession(res.data.accessToken, res.data.refreshToken);
                }
            }));
    }

    logout(): void {
        this.http.post(API_ENDPOINTS.auth.logout, {}).subscribe({
            complete: () => this.clearSession(),
            error: () => this.clearSession(),
        });
    }

    setSession(accessToken: string, refreshToken: string): void {
        this.tokenService.setTokens(accessToken, refreshToken);

        const user = this.extractUserFromToken(accessToken);

        if (user) {
            this.storage.setJson(STORAGE_KEYS.currentUser, user);
            this._currentUser.set(user);
        } else {
            this._currentUser.set(null);
        }

        this.refreshSpecialistStatus();
    }

    updateAvatar(avatarUrl: string): void {
        const user = this._currentUser();
        if (user) {
            const updatedUser = { ...user, avatarUrl };
            this._currentUser.set(updatedUser);
            this.storage.setJson(STORAGE_KEYS.currentUser, updatedUser);
        }
    }

    refreshSpecialistStatus(): void {
        if (!this.isAuthenticated()) {
            this._specialistStatus.set(null);
            return;
        }

        this.http.get<ApiResponse<{ status: number }>>(API_ENDPOINTS.specialists.verification)
            .pipe(
                catchError((err: HttpErrorResponse) => {
                    if (err.status === 404) {
                        return of({ data: { status: -1 } } as ApiResponse<{ status: number }>);
                    }
                    this._specialistStatus.set(null);
                    return of(null as unknown as ApiResponse<{ status: number }>);
                }),
            )
            .subscribe({
                next: (res) => {
                    if (!res) return;
                    const mapped = STATUS_MAP[res.data?.status ?? -1];
                    this._specialistStatus.set(mapped ?? null);
                },
                error: () => this._specialistStatus.set(null),
            });
    }

    clearSession(): void {
        this.tokenService.clearTokens();
        this.storage.remove(STORAGE_KEYS.currentUser);
        this._currentUser.set(null);
        this._specialistStatus.set(null);
        this.injector.get(NavigationService).redirectAfterLogout();
        this.clearProfileStore();
    }

    private clearProfileStore(): void {
        import('@features/profile/stores/profile.store').then(m => {
            this.injector.get(m.ProfileStore).reset();
        }).catch(() => {});
    }

    hasRole(...roles: UserRole[]): boolean {
        const userRoles = this._currentUser()?.roles;
        if (!userRoles) return false;
        return roles.some(r => userRoles.includes(r));
    }

    private mapRole(role: unknown): UserRole {
        if (typeof role === 'number' && role in UserRole) {
            return role as UserRole;
        }

        const roles = Array.isArray(role)
            ? role.map(r => String(r))
            : typeof role === 'string'
                ? [role]
                : [];

        if (roles.includes('Admin')) return UserRole.Admin;
        if (roles.includes('Specialist')) return UserRole.Specialist;

        return UserRole.User;
    }

    private mapRoles(role: unknown): UserRole[] {
        const raw = Array.isArray(role) ? role : [role];
        return raw.map(r => this.mapRole(r));
    }

    private extractUserFromToken(accessToken: string): CurrentUser | null {
        const decoded = this.tokenService.decodeToken(accessToken);
        if (!decoded) return null;

        return {
            id: (decoded.sub || decoded['nameid'] || '') as string,
            email: (decoded['email'] as string) || '',
            fullName: (decoded['name'] as string) || (decoded['unique_name'] as string) || '',
            roles: this.mapRoles(decoded['role']),
            avatarUrl: (decoded['avatar'] as string) || (decoded['picture'] as string) || null,
        };
    }

    private restoreUser(): CurrentUser | null {
        const hasRefreshToken = !!this.tokenService.getRefreshToken();
        if (!hasRefreshToken) return null;

        const stored = this.storage.getJson<Record<string, unknown>>(STORAGE_KEYS.currentUser);
        if (!stored) return null;

        let roles: UserRole[];
        if (Array.isArray(stored['roles'])) {
            roles = stored['roles'] as UserRole[];
        } else if (stored['role'] !== undefined) {
            roles = [this.mapRole(stored['role'])];
        } else {
            roles = [UserRole.User];
        }

        return {
            id: (stored['id'] as string) || '',
            email: (stored['email'] as string) || '',
            fullName: (stored['fullName'] as string) || '',
            roles,
            avatarUrl: (stored['avatarUrl'] as string) || null,
        };
    }
}
