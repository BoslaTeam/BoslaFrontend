import { Component, inject, computed } from '@angular/core';
import { LoadingStateService } from '@core/interceptors/loading.interceptor';
import { RouteLoadingService } from '@core/services/route-loading.service';

@Component({
  selector: 'ui-global-loader',
  standalone: true,
  imports: [],
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.css',
})
export class UiGlobalLoader {
  private readonly loadingState = inject(LoadingStateService);
  private readonly routeLoading = inject(RouteLoadingService);

  /** True when any HTTP request is in-flight */
  readonly isHttpLoading = this.loadingState.isLoading;

  /** True during route navigation */
  readonly isRouteLoading = this.routeLoading.isNavigating;

  /** Show the top progress bar for either HTTP or route loading */
  readonly showProgressBar = computed(
    () => this.isHttpLoading() || this.isRouteLoading(),
  );

  /** Show the full overlay only for route transitions (lazy-loaded chunks) */
  readonly showOverlay = this.routeLoading.isNavigating;
}
