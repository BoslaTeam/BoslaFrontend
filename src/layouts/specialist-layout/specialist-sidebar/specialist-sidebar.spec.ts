import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistSidebar } from './specialist-sidebar';

describe('SpecialistSidebar', () => {
  let component: SpecialistSidebar;
  let fixture: ComponentFixture<SpecialistSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
