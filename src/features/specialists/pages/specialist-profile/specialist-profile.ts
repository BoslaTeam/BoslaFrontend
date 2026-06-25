import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpecialistApiService } from '../../data-access/specialist-api.service';
import { 
  SpecialistProfileResponse, 
  AvailabilityResponse, 
  ExperienceDto 
} from '../../models/specialist.contracts';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './specialist-profile.html',
  styleUrl: './specialist-profile.css'
})
export class SpecialistProfile implements OnInit {
  private specialistApi = inject(SpecialistApiService);
  private fb = inject(FormBuilder);

  profile: SpecialistProfileResponse | null = null;
  availabilities: AvailabilityResponse[] = [];
  experiences: ExperienceDto[] = [];

  availabilityForm: FormGroup;
  experienceForm: FormGroup;
  policyForm: FormGroup;

  daysOfWeek = [
    { value: 0, name: 'الأحد' },
    { value: 1, name: 'الإثنين' },
    { value: 2, name: 'الثلاثاء' },
    { value: 3, name: 'الأربعاء' },
    { value: 4, name: 'الخميس' },
    { value: 5, name: 'الجمعة' },
    { value: 6, name: 'السبت' }
  ];

  constructor() {
    this.availabilityForm = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });

    this.experienceForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      description: ['', Validators.required]
    });

    this.policyForm = this.fb.group({
      bookingPolicy: ['', Validators.required],
      cancellationPolicy: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.specialistApi.getProfile().subscribe(res => {
      this.profile = res;
      this.policyForm.patchValue({
        bookingPolicy: res.bookingPolicy,
        cancellationPolicy: res.cancellationPolicy
      });
    });

    this.specialistApi.getAvailability().subscribe(res => {
      this.availabilities = res;
    });

    this.specialistApi.getExperience().subscribe(res => {
      this.experiences = res;
    });
  }

  addAvailability() {
    if (this.availabilityForm.valid) {
      this.specialistApi.addAvailability(this.availabilityForm.value).subscribe(() => {
        this.loadData();
        this.availabilityForm.reset();
      });
    }
  }

  deleteAvailability(id: string) {
    this.specialistApi.deleteAvailability(id).subscribe(() => {
      this.loadData();
    });
  }

  addExperience() {
    if (this.experienceForm.valid) {
      this.specialistApi.addExperience(this.experienceForm.value).subscribe(() => {
        this.loadData();
        this.experienceForm.reset();
      });
    }
  }

  deleteExperience(id: string) {
    this.specialistApi.deleteExperience(id).subscribe(() => {
      this.loadData();
    });
  }

  updatePolicies() {
    if (this.policyForm.valid) {
      const { bookingPolicy, cancellationPolicy } = this.policyForm.value;
      
      // Since backend requires two different endpoints, let's call both
      this.specialistApi.updateBookingPolicy({ bookingPolicy }).subscribe();
      this.specialistApi.updateCancellationPolicy({ cancellationPolicy }).subscribe(() => {
        alert('تم تحديث السياسات بنجاح');
      });
    }
  }

  getDayName(dayValue: number): string {
    const day = this.daysOfWeek.find(d => d.value === dayValue);
    return day ? day.name : '';
  }
}
