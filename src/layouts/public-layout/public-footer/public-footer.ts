import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiLogo } from "@shared/ui/logo/logo";

@Component({
  selector: 'app-public-footer',
  imports: [RouterLink, UiLogo],
  templateUrl: './public-footer.html',
  styles: ``,
})
export class PublicFooter {}
