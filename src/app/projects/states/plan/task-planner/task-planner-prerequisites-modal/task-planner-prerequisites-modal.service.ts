import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Project, TaskDefinition} from 'src/app/api/models/doubtfire-model';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {
  TaskPlannerPrerequisitesModalComponent,
  TaskPlannerPrerequisitesModalData,
} from './task-planner-prerequisites-modal.component';

@Injectable({
  providedIn: 'root',
})
export class TaskPlannerPrerequisitesModalService {
  constructor(public dialog: MatDialog) {}

  public show(project: Project, taskDefinition: TaskDefinition, dependents: TaskPrerequisite[]) {
    this.dialog.open<TaskPlannerPrerequisitesModalComponent, TaskPlannerPrerequisitesModalData>(
      TaskPlannerPrerequisitesModalComponent,
      {
        data: {taskDefinition, project, dependents},
        width: '100%',
        maxWidth: '900px',
        panelClass: 'overflow-y-auto',
      },
    );
  }
}
