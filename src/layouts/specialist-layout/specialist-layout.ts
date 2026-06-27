import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpecialistHeader } from './specialist-header/specialist-header';
import { SpecialistSidebar } from './specialist-sidebar/specialist-sidebar';

@Component({
  selector: 'app-specialist-layout',
  imports: [RouterOutlet, SpecialistHeader, SpecialistSidebar],
  templateUrl: './specialist-layout.html',
  styles: ``,
})
export class SpecialistLayout {}
