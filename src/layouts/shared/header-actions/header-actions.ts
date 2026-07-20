import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { UserDropdown } from '@layouts/shared/user-dropdown/user-dropdown';
import { NotificationDropdown } from '@layouts/shared/notification-dropdown/notification-dropdown';
import { MessageDropdown } from '@layouts/shared/message-dropdown/message-dropdown';
import { LanguageToggle } from '@shared/ui/language-toggle/language-toggle';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-header-actions',
  imports: [RouterLink, UserDropdown, NotificationDropdown, MessageDropdown, LanguageToggle, TranslatePipe],
  templateUrl: './header-actions.html'
})
export class HeaderActions {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);
  readonly notificationService = inject(NotificationService);

  readonly notifOpen = signal(false);
  readonly msgOpen = signal(false);

  toggleNotif() {
    this.msgOpen.set(false);
    this.notifOpen.update(v => !v);
  }

  toggleMsg() {
    this.notifOpen.set(false);
    this.msgOpen.update(v => !v);
  }
}
