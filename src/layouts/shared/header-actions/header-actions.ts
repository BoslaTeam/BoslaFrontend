import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';
import { UserDropdown } from '@layouts/shared/user-dropdown/user-dropdown';

@Component({
  selector: 'app-header-actions',
  imports: [RouterLink, CommonModule, UserDropdown],
  templateUrl: './header-actions.html'
})
export class HeaderActions {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);
}
