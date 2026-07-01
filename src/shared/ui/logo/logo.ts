import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.html',
})
export class UiLogo {
  readonly size = input<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');

  get sizeClasses(): string {
    const classes = {
      sm: 'w-8 h-8 shrink-0',
      md: 'w-12 h-12 shrink-0',
      lg: 'w-24 h-24 shrink-0',
      xl: 'w-32 h-32 shrink-0',
      '2xl': 'w-40 h-40 shrink-0',
    };
    return classes[this.size()] || classes['md'];
  }
}