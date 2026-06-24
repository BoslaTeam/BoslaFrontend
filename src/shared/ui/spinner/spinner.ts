import { Component, input, computed } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class UiSpinner {
  readonly size = input<SpinnerSize>('md');

  readonly spinnerClasses = computed(() => {
    const sizes: Record<SpinnerSize, string> = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-xl'
    };

    return `fa-solid fa-spinner fa-spin ${sizes[this.size()] || sizes['md']}`;
  });
}