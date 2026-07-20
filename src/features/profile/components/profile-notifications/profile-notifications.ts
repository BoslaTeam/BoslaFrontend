import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { NotificationsService } from '@features/notifications/services/notifications.service';
import { NotificationPreferenceDto } from '@features/notifications/contracts/notification-preferences.contracts';
import { TranslationService } from '@core/services/translation.service';

import { TranslatePipe } from '@shared/pipes/translate.pipe';

type NotificationScope = 'everyone' | 'specialist' | 'admin';

const SCOPE: Record<string, NotificationScope> = {
  Message: 'everyone',
  Booking: 'everyone',
  Reminder: 'everyone',
  SpecialistVerification: 'specialist',
  Withdrawal: 'specialist',
  PortfolioApproved: 'specialist',
  PortfolioRejected: 'specialist',
  PortfolioPendingReview: 'admin',
};

const TYPE_LABEL_KEYS: Record<string, string> = {
  Message: 'notificationType.Message',
  Booking: 'notificationType.Booking',
  Reminder: 'notificationType.Reminder',
  SpecialistVerification: 'notificationType.SpecialistVerification',
  Withdrawal: 'notificationType.Withdrawal',
  PortfolioApproved: 'notificationType.PortfolioApproved',
  PortfolioRejected: 'notificationType.PortfolioRejected',
  PortfolioPendingReview: 'notificationType.PortfolioPendingReview',
};

const TYPE_ICONS: Record<string, string> = {
  Message: 'fa-regular fa-envelope',
  Booking: 'fa-regular fa-calendar-check',
  Reminder: 'fa-regular fa-bell',
  SpecialistVerification: 'fa-solid fa-certificate',
  Withdrawal: 'fa-solid fa-arrow-up-from-bracket',
  PortfolioApproved: 'fa-solid fa-check-circle',
  PortfolioRejected: 'fa-solid fa-times-circle',
  PortfolioPendingReview: 'fa-regular fa-clock',
};

@Component({
  selector: 'app-profile-notifications',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="space-y-4">
      <p class="text-sm text-slate-500 font-semibold mb-4">{{ 'profile.notificationsSubtitle' | t }}</p>

      @if (isLoading()) {
        <div class="flex justify-center py-8">
          <div class="w-8 h-8 border-[3px] border-bosla-primary/20 border-t-bosla-primary rounded-full animate-spin"></div>
        </div>
      }

      @for (pref of visiblePreferences(); track pref.type) {
        <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-bosla-primary/10 flex items-center justify-center text-bosla-primary">
              <i [class]="getIcon(pref.type)"></i>
            </div>
            <div>
              <p class="font-bold text-bosla-primary text-sm">{{ getLabel(pref.type) }}</p>
              <p class="text-xs text-slate-400">{{ getLabel(pref.type) }}</p>
            </div>
          </div>
          <button (click)="toggle(pref)"
            class="w-12 h-6 rounded-full transition-all duration-300 p-0.5 flex items-center"
            [class.bg-bosla-primary]="pref.enabled"
            [class.bg-slate-300]="!pref.enabled">
            <div class="w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300"
              [class.ms-auto]="pref.enabled"
              [class.me-auto]="!pref.enabled">
            </div>
          </button>
        </div>
      }
    </div>
  `,
})
export class ProfileNotifications implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly translationService = inject(TranslationService);

  preferences = signal<NotificationPreferenceDto[]>([]);
  isLoading = signal(true);

  readonly visiblePreferences = computed(() => {
    const role = this.authService.userRole();
    const all = this.preferences();
    return all.filter(p => {
      const scope = SCOPE[p.type] || 'everyone';
      if (scope === 'everyone') return true;
      if (role === UserRole.Admin && scope === 'admin') return true;
      if (role === UserRole.Specialist && scope === 'specialist') return true;
      return false;
    });
  });

  ngOnInit() {
    this.load();
  }

  private load() {
    this.isLoading.set(true);
    this.notificationsService.getPreferences().subscribe({
      next: (res) => {
        this.preferences.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggle(pref: NotificationPreferenceDto) {
    const newEnabled = !pref.enabled;
    this.notificationsService.updatePreference(pref.type, newEnabled).subscribe({
      next: () => {
        this.preferences.update(list =>
          list.map(p => p.type === pref.type ? { ...p, enabled: newEnabled } : p)
        );
      },
    });
  }

  getLabel(type: string): string {
    const key = TYPE_LABEL_KEYS[type];
    return key ? this.translationService.translate(key) : type;
  }

  getIcon(type: string): string {
    return TYPE_ICONS[type] || 'fa-regular fa-bell';
  }
}
