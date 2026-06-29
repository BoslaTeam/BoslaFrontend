import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileStore } from '../../stores/profile.store';

@Component({
  selector: 'app-profile-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-education.html',
})
export class ProfileEducation {
  readonly profileStore = inject(ProfileStore);
  private fb = inject(FormBuilder);

  readonly educations = this.profileStore.educations;

  educationForm: FormGroup;

  constructor() {
    this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      startYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      endYear: ['']
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

      this.profileStore.addEducation(payload);
      this.educationForm.reset({ startYear: new Date().getFullYear() });
    }
  }

  deleteEducation(id: string) {
    this.profileStore.deleteEducation(id);
  }
}
