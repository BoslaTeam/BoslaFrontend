import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from '../services/auth';
import { TokenService } from '../services/token';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // If we get a 401, handle refresh token logic
      if (error instanceof HttpErrorResponse && error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          const refreshToken = tokenService.getRefreshToken();
          const accessToken = tokenService.getAccessToken();

          if (refreshToken && accessToken) {
            return authService.refresh({ accessToken, refreshToken }).pipe(
              switchMap((res) => {
                isRefreshing = false;
                if (res.data?.accessToken) {
                  refreshTokenSubject.next(res.data.accessToken);
                  return next(req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${res.data.accessToken}`
                    }
                  }));
                }
                throw new Error('No access token returned');
              }),
              catchError((err) => {
                isRefreshing = false;
                tokenService.clearTokens();
                router.navigate(['/login']);
                return throwError(() => err);
              })
            );
          } else {
            isRefreshing = false;
            tokenService.clearTokens();
            router.navigate(['/login']);
            return throwError(() => error);
          }
        } else {
          // If already refreshing, wait for the new token
          return refreshTokenSubject.pipe(
            filter(token => token != null),
            take(1),
            switchMap(jwt => {
              return next(req.clone({
                setHeaders: {
                  Authorization: `Bearer ${jwt}`
                }
              }));
            })
          );
        }
      }
      return throwError(() => error);
    })
  );
};
