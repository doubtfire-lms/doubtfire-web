import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaffTaskListComponent } from './staff-task-list.component';

describe('StaffTaskListComponent', () => {
  let component: StaffTaskListComponent;
  let fixture: ComponentFixture<StaffTaskListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaffTaskListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffTaskListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
