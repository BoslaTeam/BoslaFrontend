import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-logo',
  standalone: true,
  imports: [],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class UiLogo {
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  get sizeClasses(): string {
    const classes = {
      sm: 'w-8 h-8 shrink-0',    
      md: 'w-12 h-12 shrink-0', 
      lg: 'w-24 h-24 shrink-0'   
    };
    return classes[this.size()] || classes['md'];
  }
}