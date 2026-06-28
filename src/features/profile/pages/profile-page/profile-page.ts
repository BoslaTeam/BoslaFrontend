import { Component, inject } from '@angular/core';
import { ProfileStore } from '../../stores/profile.store';
import { ProfileBasic } from '../../components/profile-basic/profile-basic';
import { ProfileSecurity } from '../../components/profile-security/profile-security';
import { ProfileEducation } from '../../components/profile-education/profile-education';
import { ProfileSocial } from '../../components/profile-social/profile-social';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    ProfileBasic,
    ProfileSecurity,
    ProfileEducation,
    ProfileSocial,
],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly profileStore = inject(ProfileStore);

  constructor() {
    this.profileStore.loadProfileData();
  }
}
