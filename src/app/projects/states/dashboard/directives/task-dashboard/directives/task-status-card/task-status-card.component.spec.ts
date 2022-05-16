import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskStatusCardComponent } from './task-status-card.component';
import { taskService, extensionModal } from 'src/app/ajs-upgraded-providers';
describe('TaskStatusCardComponent', () => {
  let component: TaskStatusCardComponent;
  let fixture: ComponentFixture<TaskStatusCardComponent>;
  let alertServiceStub: jasmine.SpyObj<any>;
  let taskServiceStub: jasmine.SpyObj<any>;
  let extensionModalStub: jasmine.SpyObj<any>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskStatusCardComponent ],
      providers: [
        { provide: taskService, useValue: taskServiceStub },
        { provide: extensionModal, useValue: extensionModalStub }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskStatusCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});