import { Component, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { NavigationService } from '@core/navigation/navigation.service';

@Component({
  selector: 'app-user-dropdown',
  imports: [RouterLink, CommonModule],
  templateUrl: './user-dropdown.html'
})
export class UserDropdown {
  readonly authService = inject(AuthService);
  readonly navigationService = inject(NavigationService);

  readonly isOpen = input(false);
  readonly close = output<void>();

  readonly headerModel = this.navigationService.headerModel;

  closeDropdown() {
    this.close.emit();
  }
}
