import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileStore } from '../../stores/profile.store';
import { AuthService } from '@core/services/auth.service';
import { ProfileBasic } from '../../components/profile-basic/profile-basic';
import { ProfileSecurity } from '../../components/profile-security/profile-security';
import { ProfileEducation } from '../../components/profile-education/profile-education';
import { ProfileSocial } from '../../components/profile-social/profile-social';

export type ProfileSection = 'basic' | 'education' | 'social' | 'security';

interface NavItem {
  key: ProfileSection;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ProfileBasic,
    ProfileSecurity,
    ProfileEducation,
    ProfileSocial,
  ],
  templateUrl: './profile-page.html',
})
export class ProfilePage implements OnInit {
  private readonly profileStore = inject(ProfileStore);
  readonly authService = inject(AuthService);

  readonly activeSection = signal<ProfileSection>('basic');
  readonly profile = this.profileStore.profile;

  avatarPreviewUrl: string | null = null;
  profileImageError = false;

  readonly navItems: NavItem[] = [
    { key: 'basic', label: 'المعلومات الشخصية', icon: 'fa-solid fa-user' },
    { key: 'education', label: 'التعليم', icon: 'fa-solid fa-graduation-cap' },
    { key: 'social', label: 'الروابط الاجتماعية', icon: 'fa-solid fa-link' },
    { key: 'security', label: 'الأمان', icon: 'fa-solid fa-lock' },
  ];

  ngOnInit(): void {
    this.profileStore.loadProfileData();
    this.avatarPreviewUrl = this.initialAvatarUrl;
  }

  setSection(section: ProfileSection): void {
    this.activeSection.set(section);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      this.profileImageError = false;
      this.profileStore.uploadAvatar(file);
    }
  }

  onProfileImageError(): void {
    this.profileImageError = true;
    this.avatarPreviewUrl = null;
  }

  private get initialAvatarUrl(): string | null {
    return this.profile()?.profilePictureUrl
      || this.authService.currentUser()?.avatarUrl
      || null;
  }

  get userName(): string {
    return this.profile()?.name || this.authService.currentUser()?.fullName || 'مستخدم';
  }

  get userTitle(): string {
    return this.profile()?.title || '';
  }
}
