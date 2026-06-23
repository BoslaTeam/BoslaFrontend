import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToast } from "@shared/ui/toast/toast";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiToast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BoslaFrontend');
}
