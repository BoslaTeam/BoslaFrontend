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
      success: 'bg-[#e6f7ed] border-[#ccefdc] text-[#006633] border-r-4 border-r-[#008a47]',
      danger: 'bg-[#fdeaea] border-[#fbc9c9] text-[#ba1a1a] border-r-4 border-r-[#ba1a1a]', // اللون الأحمر الرسمي
      warning: 'bg-[#fff9e6] border-[#ffe8cc] text-[#b36b00] border-r-4 border-r-[#ff9900]',
      info: 'bg-[#eaf4fa] border-[#cbe3f5] text-[#0066b3] border-r-4 border-r-[#0084e6]'
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