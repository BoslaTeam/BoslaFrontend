import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../stores/profile.store';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-basic.html',
})
export class ProfileBasic {
  readonly profileStore = inject(ProfileStore);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  avatarPreviewUrl: string | null = null;
  profileImageError = false;

  basicInfoForm: FormGroup;

  constructor() {
    this.basicInfoForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: [''],
      country: [''],
      title: [''],
      bio: [''],
      gender: [''],
      preferredLanguage: ['']
    });

    effect(() => {
      const p = this.profileStore.profile();
      if (p) {
        this.basicInfoForm.patchValue({
          name: p.name,
          phoneNumber: p.phoneNumber,
          country: p.country,
          title: p.title || '',
          bio: p.bio || '',
          gender: p.gender || '',
          preferredLanguage: p.preferredLanguage || ''
        });
        this.avatarPreviewUrl = p.profilePictureUrl || this.authService.currentUser()?.avatarUrl || null;
      }
    });
  }

  updateBasicInfo() {
    if (this.basicInfoForm.valid) {
      this.profileStore.updateProfile(this.basicInfoForm.value);
    }
  }

  onAvatarSelected(event: Event) {
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

  onProfileImageError() {
    this.profileImageError = true;
    this.avatarPreviewUrl = null;
  }
}
