import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UiLogo } from '@shared/ui/logo/logo';

@Component({
  selector: 'app-specialist-header',
  imports: [RouterLink, UiLogo, RouterLinkActive],
  templateUrl: './specialist-header.html',
  styles: ``,
})
export class SpecialistHeader {
  protected readonly authService = inject(AuthService);
  avatarError = false;

  onAvatarError() {
    this.avatarError = true;
  }

  logout() {
    this.authService.logout();
  }
}
