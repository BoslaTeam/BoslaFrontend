import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistAvailability } from './specialist-availability';

describe('SpecialistAvailability', () => {
  let component: SpecialistAvailability;
  let fixture: ComponentFixture<SpecialistAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistAvailability],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistAvailability);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
