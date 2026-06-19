import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'app-user-header',
  imports: [RouterLink],
  templateUrl: './user-header.html',
  styleUrl: './user-header.css',
})
export class UserHeader {
  readonly authService = inject(AuthService);
  readonly notificationService = inject(NotificationService);
}
