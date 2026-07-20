import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_CONFIG } from '@core/config/auth.config';
import { TranslationService } from '@core/services/translation.service';
import { ToastService } from '@core/services/toast.service';
import { ApiError } from '@shared/types/api-error.type';
import { catchError, throwError } from 'rxjs';


/** Statuses handled by dedicated flows elsewhere — do not surface a generic toast for these. */
const SILENT_STATUSES = [401, 404, 409, 422];

const DATA_PREFIXES = ['/api/', '/v1/'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let t: TranslationService | null = null;
  try { t = inject(TranslationService); } catch { /* circular guard — TranslationService not ready yet */ }

  const toast = inject(ToastService);
  const translate = (key: string): string => t ? t.translate(key) : key;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = normalizeError(error, translate);
      const isApiCall = DATA_PREFIXES.some((p) => req.url.includes(p));

      if (error.status === 403 && !isApiCall && !req.url.includes('/auth/')) {
        router.navigateByUrl(AUTH_CONFIG.unauthorizedRoute);
      } else if (!SILENT_STATUSES.includes(error.status) && isApiCall) {
        toast.danger(apiError.title);
      }

      return throwError(() => apiError);
    }),
  );
};

function normalizeError(error: HttpErrorResponse, translate: (key: string) => string): ApiError {
  const body = error.error as Partial<ApiError> | null;

  return {
    type: body?.type,
    title: body?.title ?? translate('errors.unknownError'),
    status: error.status ?? 500,
    detail: body?.detail,
    instance: body?.instance,
    errors: body?.errors,
    traceId: body?.traceId,
  };
}
