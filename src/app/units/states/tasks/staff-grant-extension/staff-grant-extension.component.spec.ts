import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffGrantExtensionComponent } from './staff-grant-extension.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TaskDefinition } from 'src/app/api/models/doubtfire-model';

describe('StaffGrantExtensionComponent', () => {
  let component: StaffGrantExtensionComponent;
  let fixture: ComponentFixture<StaffGrantExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StaffGrantExtensionComponent,
        MatDialogModule,
        MatIconModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffGrantExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form disabled initially', () => {
    expect(component.isFormActive).toBeFalse();
    expect(component.selectedTaskDefinition).toBeNull();
  });

  it('should enable form when task is selected', () => {
    const mockTaskDefinition = {
      id: 1,
      name: 'Test Task'
    } as unknown as TaskDefinition;

    component.selectedTaskDefinition$.next(mockTaskDefinition);

    expect(component.isFormActive).toBeTrue();
    expect(component.selectedTaskDefinition).toEqual(mockTaskDefinition);
  });

  it('should reset form after submission', () => {
    // First select a task
    const mockTaskDefinition = {
      id: 1,
      name: 'Test Task'
    } as unknown as TaskDefinition;
    component.selectedTaskDefinition$.next(mockTaskDefinition);

    // Then submit
    component.onFormSubmitted();

    expect(component.isFormActive).toBeFalse();
    expect(component.selectedTaskDefinition).toBeNull();
  });
});
