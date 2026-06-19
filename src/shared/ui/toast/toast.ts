import { Component, inject } from '@angular/core';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {

  readonly toastService = inject(ToastService);

  getVariantClasses(variant: string): string {
    const variants: Record<string, string> = {
      success: 'border-emerald-100 bg-emerald-50/90 text-emerald-800',
      danger: 'border-red-100 bg-red-50/90 text-red-800',
      warning: 'border-amber-100 bg-amber-50/90 text-amber-800',
      info: 'border-blue-100 bg-blue-50/90 text-blue-800'
    };
    return variants[variant] || variants['info'];
  }

  getVariantIcon(variant: string): string {
    const icons: Record<string, string> = {
      success: '✅',
      danger: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[variant] || icons['info'];
  }

}
