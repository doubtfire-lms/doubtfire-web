import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {TaskIloAlignmentModalComponent} from './task-ilo-alignment-modal.component';
import {
  Task,
  LearningOutcome,
  TaskOutcomeAlignment,
  Unit,
  Project,
} from 'src/app/api/models/doubtfire-model';
import {Observable} from 'rxjs';

export interface TaskIloAlignmentModalData {
  task: Task;
  ilo: LearningOutcome;
  alignment: TaskOutcomeAlignment;
  unit: Unit;
  project?: Project;
  source: Unit | Project;
}

@Injectable({
  providedIn: 'root',
})
export class TaskIloAlignmentModalService {
  constructor(private dialog: MatDialog) {}

  public show(
    task: Task,
    ilo: LearningOutcome,
    alignment: TaskOutcomeAlignment,
    unit: Unit,
    project: Project,
    source: Unit | Project,
  ): Observable<TaskOutcomeAlignment> {
    const dialogRef = this.dialog.open(TaskIloAlignmentModalComponent, {
      width: '600px',
      data: {task, ilo, alignment, unit, project, source},
    });

    return dialogRef.afterClosed();
  }
}
