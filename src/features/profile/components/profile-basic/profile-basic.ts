import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { UserProfileService } from '../../../users/services/user-profile.service';
import { AuthService } from '@core/services/auth.service';
import { UserProfileDto } from '../../../users/contracts/user.contracts';

@Component({
  selector: 'app-profile-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-basic.html',
})
export class ProfileBasic implements OnInit {
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  profile: UserProfileDto | null = null;
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

    merge(
      this.basicInfoForm.statusChanges,
      this.basicInfoForm.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userProfileService.getProfile().subscribe(res => {
      this.profile = res;
      this.basicInfoForm.patchValue({
        name: res.name,
        phoneNumber: res.phoneNumber,
        country: res.country,
        title: res.title || '',
        bio: res.bio || '',
        gender: res.gender || '',
        preferredLanguage: res.preferredLanguage || ''
      });
      this.avatarPreviewUrl = res.profilePictureUrl || this.authService.currentUser()?.avatarUrl || null;
      this.cdr.markForCheck();
    });
  }

  updateBasicInfo() {
    if (this.basicInfoForm.valid) {
      this.userProfileService.updateProfile(this.basicInfoForm.value).subscribe(res => {
        this.profile = res;
        this.cdr.markForCheck();
        alert('تم تحديث البيانات بنجاح');
      });
    }
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        this.avatarPreviewUrl = base64Url;
      };
      reader.readAsDataURL(file);

      this.profileImageError = false;
      this.userProfileService.uploadProfileImage(file).subscribe({
        next: (res) => {
          const fileUrl = res.data || res;
          this.avatarPreviewUrl = fileUrl;
          this.profileImageError = false;
          this.authService.updateAvatar(fileUrl);
          alert('تم رفع الصورة بنجاح');
        },
        error: (err) => {
          console.error('Error uploading image', err);
          alert('حدث خطأ أثناء رفع الصورة');
        }
      });
    }
  }

  onProfileImageError() {
    this.profileImageError = true;
    this.avatarPreviewUrl = null;
  }
}
