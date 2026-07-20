import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@shared/pipes/translate.pipe';
@Component({
  selector: 'app-specialist-availability',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './specialist-availability.html',
})
export class SpecialistAvailability {
}
