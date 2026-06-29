import { Injectable, inject, signal, DestroyRef } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

/**
 * Tracks route navigation state by listening to Angular Router events.
 * Provides a reactive signal `isNavigating` that is true while a route
 * transition is in progress (including lazy-loaded chunk downloads).
 */
@Injectable({ providedIn: 'root' })
export class RouteLoadingService {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** True while a route navigation is in-flight */
  readonly isNavigating = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter(
          (e) =>
            e instanceof NavigationStart ||
            e instanceof NavigationEnd ||
            e instanceof NavigationCancel ||
            e instanceof NavigationError,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.isNavigating.set(true);
        } else {
          // NavigationEnd | NavigationCancel | NavigationError
          this.isNavigating.set(false);
        }
      });
  }
}
