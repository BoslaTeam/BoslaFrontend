import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { TokenService } from '@core/services/token.service';

const PUBLIC_PATHS = [
  API_ENDPOINTS.auth.login,
  API_ENDPOINTS.auth.register,
  API_ENDPOINTS.auth.refresh,
  API_ENDPOINTS.auth.forgotPassword,
  API_ENDPOINTS.auth.resetPassword
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  const isPublic = PUBLIC_PATHS.some((path) => req.url.includes(path));
  if (isPublic) return next(req);

  const accessToken = tokenService.getAccessToken();
  if (!accessToken) return next(req);

  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    }),
  );
};