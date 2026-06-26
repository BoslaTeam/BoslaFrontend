import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SpecialistApiService } from '@features/specialists/data-access/specialist-api.service';
import { SpecialistProfileResponse } from '@features/specialists/contracts/specialist-profile-response';

@Component({
  selector: 'app-specialist-layout',
  imports: [RouterOutlet],
  templateUrl: './specialist-layout.html',
})
export class SpecialistLayout implements OnInit {

  private specialistApi = inject(SpecialistApiService);

  profile = signal<SpecialistProfileResponse | null>(null);

  ngOnInit(): void {
    this.specialistApi.getMyProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
      }
    });
  }
}