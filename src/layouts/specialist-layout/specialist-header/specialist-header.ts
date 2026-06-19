import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-specialist-header',
  standalone: true,
  imports: [],
  templateUrl: './specialist-header.html',
  styleUrl: './specialist-header.css',
})
export class SpecialistHeader {
  readonly authService = inject(AuthService);
}
