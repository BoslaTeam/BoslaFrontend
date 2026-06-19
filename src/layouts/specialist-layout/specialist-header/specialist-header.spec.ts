import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistHeader } from './specialist-header';

describe('SpecialistHeader', () => {
  let component: SpecialistHeader;
  let fixture: ComponentFixture<SpecialistHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
