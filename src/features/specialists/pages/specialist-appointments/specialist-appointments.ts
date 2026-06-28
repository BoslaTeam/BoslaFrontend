import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-specialist-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './specialist-appointments.html',
})
export class SpecialistAppointments {}
