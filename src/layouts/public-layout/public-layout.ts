import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '@layouts/shared/app-header/app-header';
import { PublicFooter } from './public-footer/public-footer';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, AppHeader, PublicFooter],
  templateUrl: './public-layout.html'
})
export class PublicLayout { }
