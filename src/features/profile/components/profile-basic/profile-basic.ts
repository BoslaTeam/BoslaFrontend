import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../stores/profile.store';
import { SelectOption } from '@shared/types/select-option.type';

@Component({
  selector: 'app-profile-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-basic.html',
})
export class ProfileBasic {
  readonly profileStore = inject(ProfileStore);
  private fb = inject(FormBuilder);

  basicInfoForm: FormGroup;

  readonly genderOptions: SelectOption[] = [
    { value: 'ذكر', label: 'ذكر' },
    { value: 'أنثى', label: 'أنثى' },
  ];

  readonly languageOptions: SelectOption[] = [
    { value: 'العربية', label: 'العربية' },
    { value: 'English', label: 'English' },
  ];

  readonly countryOptions: SelectOption[] = [
    { value: 'مصر', label: 'مصر' },
    { value: 'السعودية', label: 'السعودية' },
    { value: 'الإمارات', label: 'الإمارات' },
    { value: 'قطر', label: 'قطر' },
    { value: 'الكويت', label: 'الكويت' },
    { value: 'البحرين', label: 'البحرين' },
    { value: 'عمان', label: 'عُمان' },
    { value: 'الأردن', label: 'الأردن' },
    { value: 'العراق', label: 'العراق' },
    { value: 'سوريا', label: 'سوريا' },
    { value: 'لبنان', label: 'لبنان' },
    { value: 'فلسطين', label: 'فلسطين' },
    { value: 'تونس', label: 'تونس' },
    { value: 'الجزائر', label: 'الجزائر' },
    { value: 'المغرب', label: 'المغرب' },
    { value: 'ليبيا', label: 'ليبيا' },
    { value: 'السودان', label: 'السودان' },
    { value: 'اليمن', label: 'اليمن' },
  ];

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
      }
    });
  }

  updateBasicInfo() {
    if (this.basicInfoForm.valid) {
      this.profileStore.updateProfile(this.basicInfoForm.value);
    }
  }
}
