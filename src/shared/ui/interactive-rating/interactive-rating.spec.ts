import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveRating } from './interactive-rating';

describe('InteractiveRating', () => {
  let component: InteractiveRating;
  let fixture: ComponentFixture<InteractiveRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveRating],
    }).compileComponents();

    fixture = TestBed.createComponent(InteractiveRating);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
