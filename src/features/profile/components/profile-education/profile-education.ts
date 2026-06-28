import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService } from '../../../users/services/user-profile.service';
import { EducationDto } from '../../../users/contracts/user.contracts';

@Component({
  selector: 'app-profile-education',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-education.html',
})
export class ProfileEducation implements OnInit {
  private userProfileService = inject(UserProfileService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  educations: EducationDto[] = [];
  educationForm: FormGroup;

  constructor() {
    this.educationForm = this.fb.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      startYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
      endYear: ['']
    });
  }

  ngOnInit() {
    this.loadEducations();
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
}
