import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class UiToast {

  readonly toastService = inject(ToastService);

  getVariantClasses(variant: string): string {
    const variants: Record<string, string> = {
      success: 'bg-bosla-success/5 border-bosla-success/20 text-bosla-success border-r-4 border-r-bosla-success',
      danger: 'bg-bosla-error/5 border-bosla-error/20 text-bosla-error border-r-4 border-r-bosla-error',
      warning: 'bg-bosla-orange/5 border-bosla-orange/20 text-bosla-orange border-r-4 border-r-bosla-orange',
      info: 'bg-bosla-blue/5 border-bosla-blue/20 text-bosla-blue border-r-4 border-r-bosla-blue'
    };
    return variants[variant] || variants['info'];
  }

  /**
   */
  getVariantIcon(variant: string): string {
    const icons: Record<string, string> = {
      success: 'fa-regular fa-circle-check',
      danger: 'fa-solid fa-circle-exclamation',
      warning: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info'
    };
    return icons[variant] || icons['info'];
  }
}