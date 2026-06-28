import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, filter, switchMap, take, throwError } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints'; 
import { AuthService } from '@core/services/auth.service';
import { TokenService } from '@core/services/token.service';

const REFRESH_EXCLUDED_PATHS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.refresh
];

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);

  if (REFRESH_EXCLUDED_PATHS.some((path) => req.url.includes(path))) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) return throwError(() => error);

      if (!tokenService.isRefreshing) {
        tokenService.isRefreshing = true;
        tokenService.refreshedToken$.next(null);

        return authService.refreshToken().pipe(
          switchMap((res) => {
            if (!res.data) return throwError(() => new Error('Refresh returned no data'));
            tokenService.isRefreshing = false;
            tokenService.refreshedToken$.next(res.data.accessToken);
            
            return next(
              req.clone({ setHeaders: { Authorization: `Bearer ${res.data.accessToken}` } }),
            );
          }),
          catchError((refreshError) => {
            tokenService.isRefreshing = false;
            tokenService.refreshedToken$.next(null);
            
            tokenService.clearTokens();
            authService.clearSession();
            return throwError(() => refreshError);
          }),
        );
      }

      return tokenService.refreshedToken$.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) =>
          next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
        ),
      );
    }),
  );
};