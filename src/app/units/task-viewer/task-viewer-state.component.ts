/* eslint-disable @typescript-eslint/no-explicit-any */
import {ExtendedModule} from 'ng-flex-layout/extended';
import {FlexModule} from 'ng-flex-layout/flex';
import {AsyncPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {of} from 'rxjs';
import {TaskDefinition, Unit} from 'src/app/api/models/doubtfire-model';
import {FTaskDetailsViewComponent} from './directives/task-details-view/task-details-view.component';
import {FTaskSheetViewComponent} from './directives/task-sheet-view/task-sheet-view.component';
import {FUnitTaskListComponent} from './directives/unit-task-list/unit-task-list.component';

@Component({
  selector: 'f-task-viewer-state',
  templateUrl: './task-viewer-state.component.html',
  styleUrl: './task-viewer-state.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    FlexModule,
    ExtendedModule,
    FUnitTaskListComponent,
    FTaskDetailsViewComponent,
    FTaskSheetViewComponent,
    MatIconButton,
    MatTooltip,
    MatIcon,
    AsyncPipe,
  ],
})
export class TaskViewerStateComponent {
  @Input() public unit$: Observable<Unit>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.unit$ = of(this.route.parent.snapshot.data.unit);
    const taskAbbreviation = this.route.snapshot.paramMap.get('taskAbbreviation');
    if (taskAbbreviation) {
      this.unit$.subscribe((unit) => {
        this.selectedTaskDefinition$.next(
          unit.taskDefinitions.find((taskDef) => taskDef.abbreviation === taskAbbreviation) ?? null,
        );
      });
    }
  }

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
    if (this.route.parent?.snapshot.data.unit) {
      this.router.navigate(['../tasks'], {relativeTo: this.route, replaceUrl: true});
      return;
    }
  }
}
