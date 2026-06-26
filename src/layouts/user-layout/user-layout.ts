import { Component } from '@angular/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { PublicHeader } from '../public-layout/public-header/public-header';
import { PublicFooter } from '../public-layout/public-footer/public-footer';

@Component({
  selector: 'app-user-layout',
  imports: [RouterLinkActive, RouterOutlet, PublicHeader, PublicFooter],
  templateUrl: './user-layout.html',
  styles: ``,
})
export class UserLayout { }
