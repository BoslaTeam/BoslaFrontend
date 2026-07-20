import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions, withInMemoryScrolling } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { refreshTokenInterceptor } from '@core/interceptors/refresh-token.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { TranslationService } from '@core/services/translation.service';

registerLocaleData(localeAr);

function initializeTranslations(service: TranslationService) {
  return (): Promise<void> =>
    service.loadTranslations().catch(() => console.error('Translation load failed'));
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'ar' },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        refreshTokenInterceptor,
        loadingInterceptor,
      ]),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTranslations,
      deps: [TranslationService],
      multi: true,
    },
  ],
};
