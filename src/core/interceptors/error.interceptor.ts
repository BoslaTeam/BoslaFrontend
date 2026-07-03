import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_CONFIG } from '@core/config/auth.config';
import { ApiError } from '@shared/types/api-error.type';
import { ToastService } from '@core/services/toast.service';
import { catchError, throwError } from 'rxjs';


/** Statuses handled by dedicated flows elsewhere — do not surface a generic toast for these. */
const SILENT_STATUSES = [401, 404, 409, 422];

const DATA_PREFIXES = ['/api/', '/v1/'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = normalizeError(error);
      const isApiCall = DATA_PREFIXES.some((p) => req.url.includes(p));

      if (error.status === 403 && !isApiCall && !req.url.includes('/auth/')) {
        router.navigateByUrl(AUTH_CONFIG.unauthorizedRoute);
      } else if (!SILENT_STATUSES.includes(error.status)) {
        // toast.danger(apiError.title);
      }

      return throwError(() => apiError);
    }),
  );
};

function normalizeError(error: HttpErrorResponse): ApiError {
  const body = error.error as Partial<ApiError> | null;

  return {
    type: body?.type,
    title: body?.title ?? 'حدث خطأ غير متوقع',
    status: error.status ?? 500,
    detail: body?.detail,
    instance: body?.instance,
    errors: body?.errors,
    traceId: body?.traceId,
  };
}