import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { UserRole } from '@core/enums/user-role.enum'; 
import { BehaviorSubject } from 'rxjs';

interface JwtPayload {
  exp: number;
  sub: string;
  role?: string | number; 
  [claim: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly storage = inject(StorageService);

  public isRefreshing = false;
  public refreshedToken$ = new BehaviorSubject<string | null>(null);

  getAccessToken(): string | null {
    return this.storage.get(STORAGE_KEYS.accessToken);
  }

  getRefreshToken(): string | null {
    return this.storage.get(STORAGE_KEYS.refreshToken);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.storage.set(STORAGE_KEYS.accessToken, accessToken);
    this.storage.set(STORAGE_KEYS.refreshToken, refreshToken);
  }

  clearTokens(): void {
    this.storage.remove(STORAGE_KEYS.accessToken);
    this.storage.remove(STORAGE_KEYS.refreshToken);
    
    this.isRefreshing = false;
    this.refreshedToken$.next(null);
  }

  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized)) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;
    const expiryMs = decoded.exp * 1000;
    return Date.now() >= expiryMs;
  }

  getUserRole(): UserRole | null {
    const token = this.getAccessToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    
    if (decoded && decoded['role'] !== undefined) {
      return Number(decoded['role']) as UserRole;
    }
    return null;
  }

  getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    const decoded = this.decodeToken(token);
    return decoded?.sub ?? null;
  }
}