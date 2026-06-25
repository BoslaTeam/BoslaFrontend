import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableRowSkeleton } from './table-row-skeleton';

describe('TableRowSkeleton', () => {
  let component: TableRowSkeleton;
  let fixture: ComponentFixture<TableRowSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableRowSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(TableRowSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
