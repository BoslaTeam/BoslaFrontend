import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavigationService } from '@core/navigation/navigation.service';

@Component({
  selector: 'app-main-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-navigation.html'
})
export class MainNavigation {
  readonly navigationService = inject(NavigationService);
  readonly links = this.navigationService.mainNavigation;
}
