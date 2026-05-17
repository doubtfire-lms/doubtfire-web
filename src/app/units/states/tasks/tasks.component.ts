import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService, TransitionService, Transition } from '@uirouter/angular';
import { TaskService } from 'src/app/api/services/task.service';

@Component({
  selector: 'f-units-tasks-state',
  templateUrl: 'tasks.component.html',
  styleUrls: ['tasks.component.scss'],
})
export class UnitsTasksStateComponent implements OnInit, OnDestroy {
  taskData: {
    taskKey: unknown;
    source: unknown;
    selectedTask: unknown;
    taskDefMode: boolean;
    onSelectedTaskChange: (task: unknown) => void;
  };

  private deregisterTransition: () => void;

  constructor(
    private stateService: StateService,
    private transitionService: TransitionService,
    private taskService: TaskService,
  ) {}

  ngOnInit(): void {
    this.taskData = {
      taskKey: null,
      source: null,
      selectedTask: null,
      taskDefMode: false,
      onSelectedTaskChange: (task: unknown) => {
        // Bug fix 4: cleaner taskKey assignment — only call taskKey() if task exists
        this.taskData.taskKey = (task as {taskKey: () => unknown})?.taskKey() ?? null;
        // Bug fix 3: avoid redundant $state.go — only navigate if task exists
        if (task) {
          this.setTaskKeyAsUrlParams(task);
        }
      },
    };

    // Read initial taskKey from URL on load
    // Bug fix 1: null-safe parsing — guard against missing params
    const initialKey = this.stateService.params?.['taskKey'];
    this.setTaskKeyFromUrlParams(initialKey);

    // Listen for state transitions to keep taskKey in sync
    this.deregisterTransition = this.transitionService.onStart({to: 'units/tasks.**'}, (trans: Transition) => {
      const toParams = trans.params('to');
      const fromState = trans.from();
      const toState = trans.to();
      const fromParams = trans.params('from');

      // Bug fix 2: force taskKeyString to a string to avoid type mismatches
      const taskKeyString = toParams['taskKey'] != null ? String(toParams['taskKey']) : null;
      this.setTaskKeyFromUrlParams(taskKeyString);

      // Bug fix 5: safer preventDefault — also check that states are defined before comparing
      if (fromState?.name && fromState.name === toState?.name && fromParams['unitId'] === toParams['unitId']) {
        return false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.deregisterTransition) {
      this.deregisterTransition();
    }
  }

  private setTaskKeyAsUrlParams(task: unknown): void {
    this.stateService.go(
      this.stateService.$current.name,
      {taskKey: (task as {taskKeyToUrlString: () => string})?.taskKeyToUrlString()},
      {notify: false },
    );
  }

  private setTaskKeyFromUrlParams(taskKeyString: string | null): void {
    if (taskKeyString) {
      this.taskData.taskKey = this.taskService.taskKeyFromString(taskKeyString);
    }
  }
}
