import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Project} from 'src/app/api/models/project';
import {TaskDefinition} from 'src/app/api/models/task-definition';

export interface TaskPlannerPrerequisitesModalData {
  taskDefinition: TaskDefinition;
  project: Project;
}

@Component({
  selector: 'f-task-planner-prerequisites-modal',
  templateUrl: './task-planner-prerequisites-modal.component.html',
  styleUrl: './task-planner-prerequisites-modal.component.scss',
})
export class TaskPlannerPrerequisitesModalComponent implements OnInit {
  @Input() taskDefinition: TaskDefinition;
  @Input() project: Project;

  public get task() {
    return this.project?.findTaskForDefinition(this.taskDefinition?.id);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: TaskPlannerPrerequisitesModalData) {}

  ngOnInit(): void {
    this.taskDefinition = this.data.taskDefinition;
    this.project = this.data.project;
  }
}
