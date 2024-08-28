import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { NewTaskOutcomeAlignmentService } from 'src/app/services/new-task-outcome-alignment.service';

@Component({
    selector: 'app-task-ilo-alignment-modal',
    templateUrl: './task-ilo-alignment-modal.component.html',
  })
  export class TaskILOAlignmentModalComponent {
    task: any;
    ilo: any;
    alignment: any;
    unit: any;
    project: any;
    source: any;
    editingRationale = false;
  
    constructor(
      private dialogRef: MatDialogRef<TaskILOAlignmentModalComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private newTaskOutcomeAlignmentService: NewTaskOutcomeAlignmentService,
      private alertService: AlertService,
      private rootScope: any
    ) {
      this.task = data.task;
      this.ilo = data.ilo;
      this.alignment = data.alignment;
      this.unit = data.unit;
      this.project = data.project;
      this.source = data.source;
  
      if (!this.alignment) {
        this.alignment = this.newTaskOutcomeAlignmentService.createInstanceFrom({}, this.source);
        this.alignment.learningOutcome = this.ilo;
        this.alignment.taskDefinition = this.task.definition;
        this.alignment.rating = 0;
        this.alignment.description = '';
      }
    }
  
    toggleEditRationale(): void {
      if (this.editingRationale) {
        this.updateAlignment();
      }
      this.editingRationale = !this.editingRationale;
    }
  
    removeAlignmentItem(): void {
      const params = this.project ? { project_id: this.project.id } : {};
  
      this.newTaskOutcomeAlignmentService.delete(this.alignment, { cache: this.alignment.within.taskOutcomeAlignmentsCache, params })
        .subscribe({
          next: () => {
            this.alertService.add('success', 'Task - Outcome alignment rating removed', 2000);
            this.rootScope.$broadcast('UpdateAlignmentChart');
            this.dialogRef.close(this.alignment);
          },
          error: (message: string) => this.alertService.add('danger', message, 6000),
        });
    }
  
    updateAlignment(): void {
      const params = this.project ? { project_id: this.project.id } : {};
  
      this.newTaskOutcomeAlignmentService.update(this.alignment, { cache: this.alignment.within.taskOutcomeAlignmentsCache, params })
        .subscribe({
          next: () => {
            this.alertService.add('success', 'Task - Outcome alignment rating saved', 2000);
            this.rootScope.$broadcast('UpdateAlignmentChart');
          },
          error: (message: string) => this.alertService.add('danger', message, 6000),
        });
    }
  
    addAlignment(): void {
      const params = this.project ? { project_id: this.project.id } : {};
  
      this.newTaskOutcomeAlignmentService.store(this.alignment, { cache: this.source.taskOutcomeAlignmentsCache, constructorParams: this.source, params })
        .subscribe({
          next: (response: any) => {
            this.alignment = response;
            this.rootScope.$broadcast('UpdateAlignmentChart');
          },
          error: (message: string) => this.alertService.add('danger', message, 6000),
        });
    }
  
    updateRating(): void {
      if (!this.alignment.id) {
        this.addAlignment();
      } else {
        this.updateAlignment();
      }
    }
  
    closeModal(): void {
      if (this.editingRationale) {
        this.updateRating();
      }
      this.dialogRef.close(this.alignment);
    }
  }
  