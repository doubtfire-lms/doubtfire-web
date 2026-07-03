import {ChangeDetectionStrategy, Component, Inject, Input, OnInit} from '@angular/core';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/list';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {Project} from 'src/app/api/models/project';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TaskPrerequisite} from 'src/app/api/models/task-prerequisite';
import {StatusIconComponent} from '../../../../../common/status-icon/status-icon.component';
import {TaskPrerequisitesCardComponent} from '../../../dashboard/directives/task-dashboard/directives/task-prerequisites-card/task-prerequisites-card.component';

export interface TaskPlannerPrerequisitesModalData {
  taskDefinition: TaskDefinition;
  project: Project;
  dependents: TaskPrerequisite[];
}

@Component({
  selector: 'f-task-planner-prerequisites-modal',
  templateUrl: './task-planner-prerequisites-modal.component.html',
  styleUrl: './task-planner-prerequisites-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    StatusIconComponent,
    MatCardContent,
    MatCardSubtitle,
    TaskPrerequisitesCardComponent,
    MatDivider,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIcon,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
  ],
})
export class TaskPlannerPrerequisitesModalComponent implements OnInit {
  @Input() taskDefinition: TaskDefinition;
  @Input() project: Project;
  @Input() dependents: TaskPrerequisite[];

  public dataSource: MatTableDataSource<TaskPrerequisite> = new MatTableDataSource();
  public displayedColumns: string[] = ['task-definition', 'current-status', 'required-status'];

  public get task() {
    return this.project?.findTaskForDefinition(this.taskDefinition?.id);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: TaskPlannerPrerequisitesModalData) {}

  ngOnInit(): void {
    this.taskDefinition = this.data.taskDefinition;
    this.project = this.data.project;
    this.dependents = this.data.dependents;
    this.dataSource.data = this.dependents;
  }
}
