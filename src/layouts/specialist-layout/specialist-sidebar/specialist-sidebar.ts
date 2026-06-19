import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-specialist-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './specialist-sidebar.html',
  styleUrl: './specialist-sidebar.css',
})
export class SpecialistSidebar {}
