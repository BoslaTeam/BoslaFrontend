import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardActivityCard } from './dashboard-activity-card';

describe('DashboardActivityCard', () => {
  let component: DashboardActivityCard;
  let fixture: ComponentFixture<DashboardActivityCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardActivityCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardActivityCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
