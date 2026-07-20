import { Component, input, output } from '@angular/core';

export type DrawerPosition = 'start' | 'end';

@Component({
  selector: 'ui-drawer',
  standalone: true,
  imports: [],
  templateUrl: './drawer.html',
})
export class Drawer {
  readonly open = input(false);
  readonly title = input<string>('');
  readonly position = input<DrawerPosition>('end');
  readonly closeOnBackdrop = input(true);

  readonly close = output<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) this.close.emit();
  }
}
