import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistFilters } from './specialist-filters';

describe('SpecialistFilters', () => {
  let component: SpecialistFilters;
  let fixture: ComponentFixture<SpecialistFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
