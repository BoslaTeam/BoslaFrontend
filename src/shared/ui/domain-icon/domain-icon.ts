import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-domain-icon',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br transition-all duration-300"
         [ngClass]="getBgColor()">
      <!-- Frontend -->
      @if (isMatch('frontend') || isMatch('front-end')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      }
      <!-- Backend -->
      @else if (isMatch('backend') || isMatch('back-end')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      }
      <!-- DevOps -->
      @else if (isMatch('devops')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      }
      <!-- Data Science -->
      @else if (isMatch('data')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
      <!-- Cybersecurity -->
      @else if (isMatch('cyber') || isMatch('security') || isMatch('أمن')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      }
      <!-- Cloud Computing -->
      @else if (isMatch('cloud') || isMatch('سحاب')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      }
      <!-- Mobile -->
      @else if (isMatch('mobile') || isMatch('تطبيق')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      }
      <!-- Machine Learning / AI -->
      @else if (isMatch('machine') || isMatch('ai') || isMatch('ذكاء') || isMatch('learning')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      }
      <!-- Law -->
      @else if (isMatch('law') || isMatch('قانون')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      }
      <!-- Finance -->
      @else if (isMatch('finance') || isMatch('مال')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      <!-- Health -->
      @else if (isMatch('health') || isMatch('طب') || isMatch('صح')) {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      <!-- Default (Star/General) -->
      @else {
        <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      }
    </div>
  `
})
export class UiDomainIcon {
  @Input({ required: true }) name!: string;

  isMatch(keyword: string): boolean {
    return this.name.toLowerCase().includes(keyword.toLowerCase());
  }

  getBgColor(): string {
    if (this.isMatch('frontend')) return 'from-blue-400 to-indigo-600 shadow-indigo-500/30 shadow-lg';
    if (this.isMatch('backend')) return 'from-emerald-400 to-green-600 shadow-green-500/30 shadow-lg';
    if (this.isMatch('devops')) return 'from-purple-400 to-purple-600 shadow-purple-500/30 shadow-lg';
    if (this.isMatch('data')) return 'from-amber-400 to-orange-500 shadow-orange-500/30 shadow-lg';
    if (this.isMatch('cyber') || this.isMatch('security')) return 'from-red-400 to-rose-600 shadow-rose-500/30 shadow-lg';
    if (this.isMatch('cloud')) return 'from-cyan-400 to-blue-500 shadow-blue-500/30 shadow-lg';
    if (this.isMatch('mobile')) return 'from-pink-400 to-fuchsia-600 shadow-pink-500/30 shadow-lg';
    if (this.isMatch('machine') || this.isMatch('ai')) return 'from-violet-500 to-fuchsia-500 shadow-violet-500/30 shadow-lg';
    if (this.isMatch('law')) return 'from-slate-600 to-slate-800 shadow-slate-500/30 shadow-lg';
    if (this.isMatch('finance')) return 'from-emerald-500 to-teal-700 shadow-emerald-500/30 shadow-lg';
    if (this.isMatch('health')) return 'from-rose-400 to-red-600 shadow-red-500/30 shadow-lg';
    
    return 'from-bosla-orange to-yellow-500 shadow-yellow-500/30 shadow-lg'; // default
  }
}
