import { Component, input } from '@angular/core';

export type SkeletonShape = 'text' | 'circle' | 'rect';

@Component({
  selector: 'ui-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class Skeleton {

  readonly shape = input<SkeletonShape>('text');
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');

  getShapeClasses(): string {
    const shapes: Record<SkeletonShape, string> = {
      text: 'rounded-md my-1',
      circle: 'rounded-full',
      rect: 'rounded-xl'
    };
    return shapes[this.shape()];
  }

}
