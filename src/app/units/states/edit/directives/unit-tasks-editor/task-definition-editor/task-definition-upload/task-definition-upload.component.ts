import {ChangeDetectionStrategy, Component, Input, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {TaskDefinition, UploadRequirement} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-task-definition-upload',
  templateUrl: 'task-definition-upload.component.html',
  styleUrls: ['task-definition-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskDefinitionUploadComponent {
  @Input() public taskDefinition: TaskDefinition;
  @ViewChild('upreqTable', {static: true}) table: MatTable<UploadRequirement>;

  public columns: string[] = [
    'file-name',
    'file-type',
    'submission-history',
    'tii-check',
    'flag-pct',
    'row-actions',
  ];

  constructor(private constants: DoubtfireConstants) {}

  public get unit(): Unit {
    return this.taskDefinition?.unit;
  }

  public addUpReq() {
    const newLength = this.taskDefinition.uploadRequirements.length + 1;
    this.taskDefinition.uploadRequirements.push({
      key: `file${newLength - 1}`,
      type: 'code',
      name: '',
      tiiCheck: false,
      tiiPct: 30,
      submissionHistory: false,
    });
    this.table.renderRows();
  }

  public tiiEnabled(): boolean {
    return this.constants.IsTiiEnabled.value;
  }

  public get missingOverseerSubmissionHistory(): boolean {
    return (
      this.taskDefinition.assessmentEnabled &&
      !this.taskDefinition.uploadRequirements.some((requirement) => requirement.submissionHistory)
    );
  }

  public removeUpReq(upreq: UploadRequirement) {
    this.taskDefinition.uploadRequirements = this.taskDefinition.uploadRequirements.filter(
      (anUpReq) => anUpReq.key != upreq.key,
    );
  }
}
