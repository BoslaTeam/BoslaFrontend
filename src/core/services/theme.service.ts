import { Injectable, effect, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  readonly theme = signal<Theme>(this.restoreTheme());

  constructor() {
    effect(() => {
      const current = this.theme();
      document.documentElement.setAttribute('data-theme', current);
      this.storage.set(STORAGE_KEYS.theme, current);
    });
  }

  toggle(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
  }

  private restoreTheme(): Theme {
    const stored = this.storage.get(STORAGE_KEYS.theme);
    return stored === 'dark' ? 'dark' : 'light';
  }
}