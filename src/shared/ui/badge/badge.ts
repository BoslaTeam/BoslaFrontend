import { Component, input } from '@angular/core';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class Badge {
  readonly variant = input<BadgeVariant>('default');

  getVariantClasses(): string {
    const variants: Record<BadgeVariant, string> = {
      default: 'bg-slate-50 text-slate-600 ring-slate-500/10',
      success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
      warning: 'bg-amber-50 text-amber-800 ring-amber-600/11',
      danger: 'bg-red-50 text-red-700 ring-red-600/10',
      info: 'bg-blue-50 text-blue-700 ring-blue-600/10'
    };
    return variants[this.variant()];
  }
}
