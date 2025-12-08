import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TaskIloAlignmentModalData} from './task-ilo-alignment-modal.service';
import {TaskOutcomeAlignmentService} from 'src/app/api/services/task-outcome-alignment.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskOutcomeAlignment} from 'src/app/api/models/task-outcome-alignment';

@Component({
  selector: 'f-task-ilo-alignment-modal',
  templateUrl: 'task-ilo-alignment-modal.component.html',
  styleUrls: ['task-ilo-alignment-modal.component.scss'],
})
export class TaskIloAlignmentModalComponent implements OnInit {
  public alignment: TaskOutcomeAlignment;
  public editingRationale = false;

  // Ported from outcome-service.coffee
  // Index 0 matches "0" rating (which we don't show as a button, but exists as state)
  public alignmentLabels = [
    'The task is not related to this outcome at all',
    'The task is slightly related to this outcome',
    'The task is related to this outcome',
    'The task is a reasonable example for this outcome',
    'The task is a strong example of this outcome',
    'The task is the best example of this outcome',
  ];

  constructor(
    public dialogRef: MatDialogRef<TaskIloAlignmentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskIloAlignmentModalData,
    private alignmentService: TaskOutcomeAlignmentService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    if (!this.data.alignment) {
      this.alignment = this.alignmentService.createInstanceFrom({}, this.data.source);
      this.alignment.learningOutcome = this.data.ilo;
      this.alignment.taskDefinition = this.data.task.definition;
      this.alignment.rating = 0;
      this.alignment.description = '';
      this.alignment.within = this.data.source;
    } else {
      this.alignment = this.data.alignment;
    }

    this.alignment.within = this.data.source;
  }

  toggleEditRationale(): void {
    if (this.editingRationale) {
      this.save();
    }
    this.editingRationale = !this.editingRationale;
  }

  onRatingChange(val: number): void {
    this.alignment.rating = val;
    this.save();
  }

  removeAlignmentItem(): void {
    const params = this.data.project ? {project_id: this.data.project.id} : undefined;

    this.alignmentService
      .delete(this.alignment, {
        cache: this.alignment.within.taskOutcomeAlignmentsCache,
        params: params,
      })
      .subscribe({
        next: () => {
          this.alertService.success('Alignment removed');
          this.dialogRef.close(this.alignment);
        },
        error: (msg) => this.alertService.error(msg),
      });
  }

  save(): void {
    const params = this.data.project ? {project_id: this.data.project.id} : undefined;

    if (!this.alignment.id) {
      this.alignmentService
        .store(this.alignment, {
          cache: this.data.source.taskOutcomeAlignmentsCache,
          constructorParams: this.data.source,
          params: params,
        })
        .subscribe({
          next: (response) => {
            this.alignment = response;
            this.alignment.within = this.data.source;
            this.alertService.success('Alignment saved');
          },
          error: (msg) => this.alertService.error(msg),
        });
    } else {
      this.alignmentService
        .update(this.alignment, {
          cache: this.alignment.within.taskOutcomeAlignmentsCache,
          params: params,
        })
        .subscribe({
          next: () => {
            this.alertService.success('Alignment updated');
          },
          error: (msg) => this.alertService.error(msg),
        });
    }
  }

  closeModal(): void {
    if (this.editingRationale) {
      this.save();
    }
    this.dialogRef.close(this.alignment);
  }
}
