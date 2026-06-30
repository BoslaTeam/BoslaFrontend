import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { UserProfileService } from '../../users/services/user-profile.service';
import {
  UserProfileDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  SetPasswordRequest,
  EducationDto,
  AddEducationRequest,
  SocialLinkDto,
  AddSocialLinkRequest,
} from '../../users/contracts/user.contracts';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly userProfileService = inject(UserProfileService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly profile = signal<UserProfileDto | null>(null);
  readonly educations = signal<EducationDto[]>([]);
  readonly socialLinks = signal<SocialLinkDto[]>([]);

  // ─── Reads ────────────────────────────────────────────

  loadProfile() {
    this.error.set(null);
    this.userProfileService.getProfile().subscribe({
      next: (data) => this.profile.set(data),
      error: (err) => this.error.set(err.message ?? 'Failed to load profile'),
    });
  }

  loadEducations() {
    this.error.set(null);
    this.userProfileService.getEducation().subscribe({
      next: (data) => this.educations.set(data),
      error: (err) => this.error.set(err.message ?? 'Failed to load educations'),
    });
  }

  loadSocialLinks() {
    this.error.set(null);
    this.userProfileService.getSocialLinks().subscribe({
      next: (data) => this.socialLinks.set(data),
      error: (err) => this.error.set(err.message ?? 'Failed to load social links'),
    });
  }

  loadProfileData() {
    if (this.profile() !== null && this.educations().length > 0) return;
    this.loadProfile();
    this.loadEducations();
    this.loadSocialLinks();
  }

  // ─── Mutations ────────────────────────────────────────

  updateProfile(request: UpdateProfileRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.updateProfile(request).subscribe({
      next: (res) => {
        this.profile.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to update profile');
        this.loading.set(false);
      },
    });
  }

  uploadAvatar(file: File) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.uploadProfileImage(file).subscribe({
      next: (res) => {
        const fileUrl = res.data || res;
        this.profile.update(p => p ? { ...p, profilePictureUrl: fileUrl } : p);
        this.authService.updateAvatar(fileUrl);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to upload avatar');
        this.loading.set(false);
      },
    });
  }

  changePassword(request: ChangePasswordRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.changePassword(request).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.message ?? 'Failed to change password');
        this.loading.set(false);
      },
    });
  }

  setPassword(request: SetPasswordRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.setPassword(request).subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.message ?? 'Failed to set password');
        this.loading.set(false);
      },
    });
  }

  addEducation(request: AddEducationRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.addEducation(request).subscribe({
      next: (newItem) => {
        this.educations.update(list => [...list, newItem]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to add education');
        this.loading.set(false);
      },
    });
  }

  deleteEducation(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.deleteEducation(id).subscribe({
      next: () => {
        this.educations.update(list => list.filter(e => e.id !== id));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to delete education');
        this.loading.set(false);
      },
    });
  }

  addSocialLink(request: AddSocialLinkRequest) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.addSocialLink(request).subscribe({
      next: (newItem) => {
        this.socialLinks.update(list => [...list, newItem]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to add social link');
        this.loading.set(false);
      },
    });
  }

  deleteSocialLink(id: string) {
    this.loading.set(true);
    this.error.set(null);
    this.userProfileService.deleteSocialLink(id).subscribe({
      next: () => {
        this.socialLinks.update(list => list.filter(l => l.id !== id));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Failed to delete social link');
        this.loading.set(false);
      },
    });
  }
}
