import { Component, computed, input } from '@angular/core';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ui-avatar',
  standalone: true,
  imports: [],
  templateUrl: './avatar.html',
})
export class Avatar {

  readonly src = input<string | null>(null);
  readonly name = input<string>('');
  readonly size = input<AvatarSize>('md');

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  });

  getSizeClasses(): string {
    const sizes: Record<AvatarSize, string> = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    };
    return sizes[this.size()];
  }

  getTextSizeClasses(): string {
    const textSizes: Record<AvatarSize, string> = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-xl'
    };
    return textSizes[this.size()];
  }
  
}
