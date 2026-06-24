import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiCardSkeleton } from './kpi-card-skeleton';

describe('KpiCardSkeleton', () => {
  let component: KpiCardSkeleton;
  let fixture: ComponentFixture<KpiCardSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KpiCardSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(KpiCardSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
