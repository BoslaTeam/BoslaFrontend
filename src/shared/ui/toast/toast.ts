import { Component, inject, computed } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'ui-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class UiToast {
  readonly toastService = inject(ToastService);
  private readonly translationService = inject(TranslationService);
  readonly direction = computed(() => this.translationService.currentLang() === 'ar' ? 'rtl' : 'ltr');

  getVariantClasses(variant: string): string {
    const variants: Record<string, string> = {
      success: 'bg-white border-r-4 border-r-bosla-success text-bosla-charcoal',
      danger: 'bg-white border-r-4 border-r-bosla-error text-bosla-charcoal',
      warning: 'bg-white border-r-4 border-r-bosla-orange text-bosla-charcoal',
      info: 'bg-white border-r-4 border-r-bosla-blue text-bosla-charcoal',
    };
    return variants[variant] || variants['info'];
  }

  getIconWrapperClass(variant: string): string {
    const classes: Record<string, string> = {
      success: 'bg-bosla-success/10 text-bosla-success',
      danger: 'bg-bosla-error/10 text-bosla-error',
      warning: 'bg-bosla-orange/10 text-bosla-orange',
      info: 'bg-bosla-blue/10 text-bosla-blue',
    };
    return classes[variant] || classes['info'];
  }

  getVariantIcon(variant: string): string {
    const icons: Record<string, string> = {
      success: 'fa-regular fa-circle-check',
      danger: 'fa-solid fa-circle-exclamation',
      warning: 'fa-solid fa-triangle-exclamation',
      info: 'fa-solid fa-circle-info',
    };
    return icons[variant] || icons['info'];
  }
}
