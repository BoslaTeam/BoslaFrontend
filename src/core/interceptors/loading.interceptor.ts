import { HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Injectable } from '@angular/core';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingStateService {
  private requestCount = 0;
  readonly isLoading = signal(false);

  increment(): void {
    this.requestCount++;
    this.isLoading.set(true);
  }

  decrement(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    this.isLoading.set(this.requestCount > 0);
  }
}

const SKIP_LOADING_HEADER = 'X-Skip-Loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has(SKIP_LOADING_HEADER)) {
    return next(req.clone({ headers: req.headers.delete(SKIP_LOADING_HEADER) }));
  }

  const loadingState = inject(LoadingStateService);
  loadingState.increment();

  return next(req).pipe(finalize(() => loadingState.decrement()));
};