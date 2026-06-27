import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// استيراد المكونات الخاصة بك (تأكد من صحة مسارات الملفات لديك)
import { SpecialistHeader } from './specialist-header/specialist-header';
import { SpecialistSidebar } from './specialist-sidebar/specialist-sidebar';

// استيراد الخدمات والـ Contracts الخاصة بزميلك
import { SpecialistApiService } from '@features/specialists/data-access/specialist-api.service';
import { SpecialistProfileResponse } from '@features/specialists/contracts/specialist-profile-response';

@Component({
  selector: 'app-specialist-layout',
  // دمج مصفوفة الـ imports لتشمل كل المكونات المطلوبة
  imports: [RouterOutlet, SpecialistHeader],
  templateUrl: './specialist-layout.html',
})
export class SpecialistLayout implements OnInit {

  private specialistApi = inject(SpecialistApiService);

  // السجنال الخاص ببيانات البروفايل (كود زميلك)
  profile = signal<SpecialistProfileResponse | null>(null);

  ngOnInit(): void {
    // جلب البيانات عند بدء تشغيل المكون
    this.specialistApi.getMyProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
      }
    });
  }
}