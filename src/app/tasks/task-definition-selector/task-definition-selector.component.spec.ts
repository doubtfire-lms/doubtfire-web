import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDefinitionSelectorComponent } from './task-definition-selector.component';

describe('TaskDefinitionSelectorComponent', () => {
  let component: TaskDefinitionSelectorComponent;
  let fixture: ComponentFixture<TaskDefinitionSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskDefinitionSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDefinitionSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
