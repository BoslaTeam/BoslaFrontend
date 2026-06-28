import { Component, inject, computed } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';
import { ProfileBasic } from '../../components/profile-basic/profile-basic';
import { ProfileSecurity } from '../../components/profile-security/profile-security';
import { ProfileEducation } from '../../components/profile-education/profile-education';
import { ProfileSocial } from '../../components/profile-social/profile-social';
import { SpecialistProfessional } from '../../components/specialist/specialist-professional/specialist-professional';
import { SpecialistAvailability } from '../../components/specialist/specialist-availability/specialist-availability';
import { SpecialistReviews } from '../../components/specialist/specialist-reviews/specialist-reviews';
import { ProfileSidebar } from '@features/profile/components/profile-sidebar/profile-sidebar';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ProfileBasic,
    ProfileSecurity,
    ProfileEducation,
    ProfileSocial,
    SpecialistProfessional,
    SpecialistAvailability,
    SpecialistReviews,
    ProfileSidebar
],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage {
  protected readonly authService = inject(AuthService);

  readonly isSpecialist = computed(
    () => this.authService.userRole() === UserRole.Specialist
  );
}
