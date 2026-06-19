import { Component, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ui-spinner',
  standalone: true,
  imports: [],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class Spinner {
  readonly size = input<SpinnerSize>('md');

  getSizeClasses(): string {
    const sizes: Record<SpinnerSize, string> = {
      sm: 'h-4 w-4 border',
      md: 'h-6 w-6 border-2',
      lg: 'h-8 w-8 border-3'
    };
    return sizes[this.size()];
  }
}
