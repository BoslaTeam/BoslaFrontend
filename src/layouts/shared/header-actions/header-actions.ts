import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';
import { NotificationSignalrService } from '@core/services/notification-signalr.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { UserDropdown } from '@layouts/shared/user-dropdown/user-dropdown';

@Component({
  selector: 'app-header-actions',
  imports: [RouterLink, CommonModule, UserDropdown],
  templateUrl: './header-actions.html'
})
export class HeaderActions implements OnInit {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);
  readonly notificationService = inject(NotificationService);
  private notificationSignalr = inject(NotificationSignalrService);

  ngOnInit(): void {
    this.notificationSignalr.init();
  }
}
