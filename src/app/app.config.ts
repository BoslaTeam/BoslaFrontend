import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { refreshTokenInterceptor } from '@core/interceptors/refresh-token.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        refreshTokenInterceptor,
        errorInterceptor,
        loadingInterceptor,
      ]),
    ),
  ],
};
