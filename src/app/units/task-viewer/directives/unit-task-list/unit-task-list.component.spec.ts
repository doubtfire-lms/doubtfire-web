import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FUnitTaskListComponent } from './unit-task-list.component';

describe('FUnitTaskListComponent', () => {
  let component: FUnitTaskListComponent;
  let fixture: ComponentFixture<FUnitTaskListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FUnitTaskListComponent],
    });
    fixture = TestBed.createComponent(FUnitTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
