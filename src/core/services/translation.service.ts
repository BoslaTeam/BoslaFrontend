import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

export type Lang = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(StorageService);

  readonly currentLang = signal<Lang>(this.getInitialLang());
  readonly translations = signal<Record<string, string>>({});
  readonly switchingLang = signal(false);

  private _loaded = false;

  get loaded(): boolean {
    return this._loaded;
  }

  loadTranslations(): Promise<void> {
    const lang = this.currentLang();
    return firstValueFrom(
      this.http.get<Record<string, string>>(`assets/i18n/${lang}.json`)
    ).then(translations => {
      this.translations.set(translations);
      this.applyLang(lang);
      this._loaded = true;
    }).catch(() => {
      console.error(`Failed to load ${lang}.json, trying fallback`);
      const fallback: Lang = lang === 'ar' ? 'en' : 'ar';
      return firstValueFrom(
        this.http.get<Record<string, string>>(`assets/i18n/${fallback}.json`)
      ).then(translations => {
        this.translations.set(translations);
        this.currentLang.set(fallback);
        this.applyLang(fallback);
        this._loaded = true;
      }).catch(() => {
        console.error('Fallback translation load also failed');
        this._loaded = true;
      });
    });
  }

  translate(key: string, ...args: any[]): string {
    let value = this.translations()?.[key] ?? key;
    if (args.length) {
      args.forEach((arg, i) => {
        value = value.replace(`{${i}}`, String(arg));
      });
    }
    return value;
  }

  domainName(arabicName: string): string {
    if (this.currentLang() === 'ar') return arabicName;
    const translated = this.translate(`domain.${arabicName}`);
    return translated === `domain.${arabicName}` ? arabicName : translated;
  }

  switchLang(lang: Lang): void {
    if (lang === this.currentLang()) return;
    this.switchingLang.set(true);
    this.storage.set(STORAGE_KEYS.language, lang);
    firstValueFrom(
      this.http.get<Record<string, string>>(`assets/i18n/${lang}.json`)
    ).then(translations => {
      this.translations.set(translations);
      this.currentLang.set(lang);
      this.applyLang(lang);
      this.switchingLang.set(false);
    }).catch(() => {
      console.error(`Failed to load translations: ${lang}.json`);
      this.storage.set(STORAGE_KEYS.language, this.currentLang());
      this.switchingLang.set(false);
    });
  }

  private applyLang(lang: Lang): void {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  private getInitialLang(): Lang {
    const stored = this.storage.get(STORAGE_KEYS.language);
    if (stored === 'en' || stored === 'ar') return stored;
    return 'ar';
  }
}
