import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SpecialistProfileStore } from '../../store/specialist-profile.store';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-specialist-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './specialist-profile.html',
})
export class SpecialistProfilePage implements OnInit {
  readonly profileStore = inject(SpecialistProfileStore);
  protected readonly authService = inject(AuthService);

  ngOnInit() {
    this.profileStore.loadMyData();
  }
}
