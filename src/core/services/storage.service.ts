import { Injectable, inject } from '@angular/core';
import { BROWSER_STORAGE } from '../tokens/storage.token';

@Injectable({ providedIn: 'root' })
export class StorageService {
    private readonly storage = inject(BROWSER_STORAGE);

    get(key: string): string | null {
        try {
            return this.storage.getItem?.(key) ?? null;
        } catch {
            return null;
        }
    }

    set(key: string, value: string): void {
        try {
            this.storage.setItem?.(key, value);
        } catch {
            /* storage unavailable (SSR / private mode) — fail silently */
        }
    }

    remove(key: string): void {
        try {
            this.storage.removeItem?.(key);
        } catch {
            /* noop */
        }
    }

    getJson<T>(key: string): T | null {
        const raw = this.get(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    setJson<T>(key: string, value: T): void {
        this.set(key, JSON.stringify(value));
    }

    clear(): void {
        try {
            this.storage.clear?.();
        } catch {
            /* noop */
        }
    }
}