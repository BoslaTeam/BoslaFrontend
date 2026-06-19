import { Component } from '@angular/core';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  imports: [],
  templateUrl: './public-footer.html',
  styleUrl: './public-footer.css',
})
export class PublicFooter {
  readonly year = new Date().getFullYear();
}
