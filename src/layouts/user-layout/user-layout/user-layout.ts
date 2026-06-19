import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserHeader } from '../user-header/user-header';
import { UserSidebar } from '../user-sidebar/user-sidebar';

@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, UserHeader, UserSidebar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.css',
})
export class UserLayout {}
