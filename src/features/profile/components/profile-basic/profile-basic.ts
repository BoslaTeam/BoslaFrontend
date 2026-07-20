import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../stores/profile.store';
import { SelectOption } from '@shared/types/select-option.type';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-profile-basic',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile-basic.html',
})
export class ProfileBasic {
  readonly profileStore = inject(ProfileStore);
  private fb = inject(FormBuilder);

  basicInfoForm: FormGroup;

  readonly genderOptions: SelectOption[] = [
    { value: 'ذكر', label: 'gender.male' },
    { value: 'أنثى', label: 'gender.female' },
  ];

  readonly languageOptions: SelectOption[] = [
    { value: 'العربية', label: 'language.arabic' },
    { value: 'English', label: 'language.english' },
  ];

  readonly countryOptions: SelectOption[] = [
    { value: 'مصر', label: 'country.egypt' },
    { value: 'السعودية', label: 'country.saudiArabia' },
    { value: 'الإمارات', label: 'country.uae' },
    { value: 'قطر', label: 'country.qatar' },
    { value: 'الكويت', label: 'country.kuwait' },
    { value: 'البحرين', label: 'country.bahrain' },
    { value: 'عمان', label: 'country.oman' },
    { value: 'الأردن', label: 'country.jordan' },
    { value: 'العراق', label: 'country.iraq' },
    { value: 'سوريا', label: 'country.syria' },
    { value: 'لبنان', label: 'country.lebanon' },
    { value: 'فلسطين', label: 'country.palestine' },
    { value: 'تونس', label: 'country.tunisia' },
    { value: 'الجزائر', label: 'country.algeria' },
    { value: 'المغرب', label: 'country.morocco' },
    { value: 'ليبيا', label: 'country.libya' },
    { value: 'السودان', label: 'country.sudan' },
    { value: 'اليمن', label: 'country.yemen' },
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
