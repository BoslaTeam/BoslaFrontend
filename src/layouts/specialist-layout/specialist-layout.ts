import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { SpecialistHeader } from './specialist-header/specialist-header';
import { UiLogo } from '@shared/ui/logo/logo';
import { SpecialistProfileStore } from '@features/specialists/store/specialist-profile.store';

@Component({
  selector: 'app-specialist-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SpecialistHeader, UiLogo],
  templateUrl: './specialist-layout.html',
})
export class SpecialistLayout implements OnInit {
  readonly profileStore = inject(SpecialistProfileStore);

  ngOnInit() {
    this.profileStore.loadMyData();
  }
}