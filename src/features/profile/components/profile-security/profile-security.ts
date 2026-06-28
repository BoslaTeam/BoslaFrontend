import { Component, inject, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { UserProfileService } from '../../../users/services/user-profile.service';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-security.html',
})
export class ProfileSecurity {
  private userProfileService = inject(UserProfileService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  passwordForm: FormGroup;

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    merge(
      this.passwordForm.statusChanges,
      this.passwordForm.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
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
