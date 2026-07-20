import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiLogo } from "@shared/ui/logo/logo";
import { NavigationService } from '@core/navigation/navigation.service';
import { TranslatePipe } from '@shared/pipes/translate.pipe';

@Component({
  selector: 'app-public-footer',
  imports: [RouterLink, UiLogo, TranslatePipe],
  templateUrl: './public-footer.html'
})
export class PublicFooter {
  readonly navigationService = inject(NavigationService);
}
