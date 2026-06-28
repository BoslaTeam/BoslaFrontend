import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-sidebar.html',
})
export class ProfileSidebar {
  protected readonly authService = inject(AuthService);

  readonly isSpecialist = computed(
    () => this.authService.userRole() === UserRole.Specialist
  );
}
