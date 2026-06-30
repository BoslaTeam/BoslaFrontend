import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../stores/profile.store';

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
