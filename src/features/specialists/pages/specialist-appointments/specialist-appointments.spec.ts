import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistAppointments } from './specialist-appointments';

describe('SpecialistAppointments', () => {
  let component: SpecialistAppointments;
  let fixture: ComponentFixture<SpecialistAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistAppointments],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
