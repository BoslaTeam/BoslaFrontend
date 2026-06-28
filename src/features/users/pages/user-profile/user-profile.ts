import { Component, OnInit, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProfileDto, EducationDto, SocialLinkDto } from '../../contracts/user.contracts';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@core/enums/user-role.enum';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfile implements OnInit {
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  profile: UserProfileDto | null = null;
  educations: EducationDto[] = [];
  socialLinks: SocialLinkDto[] = [];

  basicInfoForm: FormGroup;
  passwordForm: FormGroup;
  educationForm: FormGroup;
  socialLinkForm: FormGroup;

  isSpecialist = false;
  avatarPreviewUrl: string | null = null;
  profileImageError = false;

  activeTab: 'basic' | 'security' | 'education' | 'social' = 'basic';

  setTab(tab: 'basic' | 'security' | 'education' | 'social') {
    this.activeTab = tab;
    this.cdr.markForCheck();
  }

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

    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      startYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      endYear: ['']
    });

    this.socialLinkForm = this.fb.group({
      platform: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });

    // In zoneless mode, Reactive Forms don't trigger change detection automatically.
    // Subscribe to all form status/value changes to manually notify Angular.
    merge(
      this.basicInfoForm.statusChanges,
      this.basicInfoForm.valueChanges,
      this.passwordForm.statusChanges,
      this.passwordForm.valueChanges,
      this.educationForm.statusChanges,
      this.educationForm.valueChanges,
      this.socialLinkForm.statusChanges,
      this.socialLinkForm.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit() {
    this.loadProfile();
    this.loadEducations();
    this.loadSocialLinks();

    this.isSpecialist = this.authService.hasRole(UserRole.Specialist);
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
      // We already check this.isSpecialist using auth token in ngOnInit
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

  changePassword() {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      const request$ = currentPassword 
        ? this.userProfileService.changePassword({ currentPassword, newPassword })
        : this.userProfileService.setPassword({ newPassword });
      
      request$.subscribe({
        next: () => {
          alert(currentPassword ? 'تم تغيير كلمة المرور بنجاح' : 'تم تعيين كلمة المرور بنجاح');
          this.passwordForm.reset();
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Password update error:', err);
          let errorMessage = 'حدث خطأ أثناء تحديث كلمة المرور.';
          if (err.status === 400 && err.errors) {
             const errors = Object.values(err.errors).flat().join('\n');
             errorMessage = `أخطاء التحقق:\n${errors}`;
          } else if (err.error?.message) {
             errorMessage = err.error.message;
          } else if (err.title) {
             errorMessage = err.title;
          }
          alert(errorMessage);
        }
      });
    }
  }

  loadEducations() {
    this.userProfileService.getEducation().subscribe(res => {
      this.educations = res;
      this.cdr.markForCheck();
    });
  }

  addEducation() {
    if (this.educationForm.valid) {
      const val = this.educationForm.value;
      const payload = {
        ...val,
        startYear: parseInt(val.startYear, 10),
        endYear: val.endYear ? parseInt(val.endYear, 10) : null
      };

      this.userProfileService.addEducation(payload).subscribe({
        next: () => {
          this.loadEducations();
          this.educationForm.reset({ startYear: new Date().getFullYear() });
        },
        error: (err) => console.error('Add education error', err)
      });
    }
  }

  deleteEducation(id: string) {
    this.userProfileService.deleteEducation(id).subscribe(() => {
      this.loadEducations();
    });
  }

  loadSocialLinks() {
    this.userProfileService.getSocialLinks().subscribe(res => {
      this.socialLinks = res;
      this.cdr.markForCheck();
    });
  }

  addSocialLink() {
    if (this.socialLinkForm.valid) {
      this.userProfileService.addSocialLink(this.socialLinkForm.value).subscribe(() => {
        this.loadSocialLinks();
        this.socialLinkForm.reset();
      });
    }
  }

  deleteSocialLink(id: string) {
    this.userProfileService.deleteSocialLink(id).subscribe(() => {
      this.loadSocialLinks();
    });
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Show local preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Url = e.target?.result as string;
        this.avatarPreviewUrl = base64Url;
      };
      reader.readAsDataURL(file);

      // Upload to backend
      this.profileImageError = false;
      this.userProfileService.uploadProfileImage(file).subscribe({
        next: (res) => {
          // Depending on ApiResponse wrapper, get the data (which is the fileUrl)
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

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmNewPassword = control.get('confirmNewPassword');
    if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
      confirmNewPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
}

