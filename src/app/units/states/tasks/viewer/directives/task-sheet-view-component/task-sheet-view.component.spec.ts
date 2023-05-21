import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSheetViewComponent } from './task-sheet-view.component';

describe('TaskSheetViewComponent', () => {
  let component: TaskSheetViewComponent;
  let fixture: ComponentFixture<TaskSheetViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskSheetViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskSheetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
