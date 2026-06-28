import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistDashboard } from './specialist-dashboard';

describe('SpecialistDashboard', () => {
  let component: SpecialistDashboard;
  let fixture: ComponentFixture<SpecialistDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpecialistDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
