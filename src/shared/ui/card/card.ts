import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  readonly padded = input(true);
  readonly hoverable = input(false);
}
