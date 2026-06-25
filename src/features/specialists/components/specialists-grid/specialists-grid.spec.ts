import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistsGrid } from './specialists-grid';

describe('SpecialistsGrid', () => {
  let component: SpecialistsGrid;
  let fixture: ComponentFixture<SpecialistsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistsGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistsGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
