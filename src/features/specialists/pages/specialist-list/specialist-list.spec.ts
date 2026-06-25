import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistList } from './specialist-list';

describe('SpecialistList', () => {
  let component: SpecialistList;
  let fixture: ComponentFixture<SpecialistList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecialistList],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecialistList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
