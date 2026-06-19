import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistLayout } from './specialist-layout';

describe('SpecialistLayout', () => {
  let component: SpecialistLayout;
  let fixture: ComponentFixture<SpecialistLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
