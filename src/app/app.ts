import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToast } from "@shared/ui/toast/toast";
import { UiGlobalLoader } from "@shared/ui/global-loader/global-loader";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiToast, UiGlobalLoader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('BoslaFrontend');
}
