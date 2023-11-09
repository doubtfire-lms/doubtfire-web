import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksViewerComponent } from './tasks-viewer.component';

describe('TasksViewerComponent', () => {
  let component: TasksViewerComponent;
  let fixture: ComponentFixture<TasksViewerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TasksViewerComponent],
    });
    fixture = TestBed.createComponent(TasksViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
