/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, Input} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';
import {StateService} from '@uirouter/core';
import {NgHybridStateDeclaration} from '@uirouter/angular-hybrid';

@Component({
  selector: 'f-task-viewer-state',
  templateUrl: './task-viewer-state.component.html',
  styleUrl: './task-viewer-state.component.scss',
})
export class TaskViewerStateComponent {
  @Input() public unit$: Observable<Unit>;

  constructor(private stateService: StateService) {}

  /**
 * Monitor and publish the selected task definition for child components.
 * We monitor the task definition list for changes in selected task definition.
 */
  selectedTaskDefinition$: BehaviorSubject<TaskDefinition> = new BehaviorSubject<TaskDefinition>(
    null,
  );

  public get taskSelected(): boolean {
    return this.selectedTaskDef !== null;
  }

  public get selectedTaskDef(): TaskDefinition {
    return this.selectedTaskDefinition$.value;
  }

  public clearTaskSelection(): void {
    this.selectedTaskDefinition$.next(null);
    this.stateService.go('.', {taskAbbreviation: null}, {location: 'replace'});
  }
}

export const TaskViewerState: NgHybridStateDeclaration = {
  name: 'units2/tasks',
  url: '/tasks/:taskAbbreviation?',
  params: {
    taskAbbreviation: {value: null, squash: true, dynamic: true},
  },
  parent: 'unit-root-state',
  data: {
    pageTitle: 'Unit Tasks',
    roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor'],
  },
  views: {
    unitView: {
      component: TaskViewerStateComponent,
    },
  },
};
