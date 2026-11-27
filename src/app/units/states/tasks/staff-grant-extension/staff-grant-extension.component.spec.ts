import {CommonModule} from '@angular/common';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute} from '@angular/router';
import {TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {StaffGrantExtensionComponent} from './staff-grant-extension.component';

describe('StaffGrantExtensionComponent', () => {
  let component: StaffGrantExtensionComponent;
  let fixture: ComponentFixture<StaffGrantExtensionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StaffGrantExtensionComponent],
      imports: [CommonModule, MatIconModule],
      providers: [{provide: ActivatedRoute, useValue: {parent: null}}],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StaffGrantExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form disabled initially', () => {
    expect(component.isFormActive).toBe(false);
    expect(component.selectedTaskDefinition).toBeNull();
  });

  it('should enable form when task is selected', () => {
    const mockTaskDefinition = {
      id: 1,
      name: 'Test Task',
    } as unknown as TaskDefinition;

    component.selectedTaskDefinition$.next(mockTaskDefinition);

    expect(component.isFormActive).toBe(true);
    expect(component.selectedTaskDefinition).toEqual(mockTaskDefinition);
  });

  it('should disable the form when the task selection is cleared', () => {
    const mockTaskDefinition = {
      id: 1,
      name: 'Test Task',
    } as unknown as TaskDefinition;
    component.selectedTaskDefinition$.next(mockTaskDefinition);

    component.selectedTaskDefinition$.next(null);

    expect(component.isFormActive).toBe(false);
    expect(component.selectedTaskDefinition).toBeNull();
  });
});
