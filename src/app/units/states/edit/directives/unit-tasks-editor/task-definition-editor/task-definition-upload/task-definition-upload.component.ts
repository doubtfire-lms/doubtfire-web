import {ChangeDetectionStrategy, Component, Input, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatFooterCell,
  MatFooterCellDef,
  MatFooterRow,
  MatFooterRowDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {MatToolbar, MatToolbarRow} from '@angular/material/toolbar';
import {MatTooltip} from '@angular/material/tooltip';
import {TaskDefinition, UploadRequirement} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-task-definition-upload',
  templateUrl: 'task-definition-upload.component.html',
  styleUrls: ['task-definition-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatFormField,
    MatInput,
    FormsModule,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatTooltip,
    MatSuffix,
    MatIconButton,
    MatIcon,
    MatFooterCellDef,
    MatFooterCell,
    MatToolbar,
    MatToolbarRow,
    MatButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatFooterRowDef,
    MatFooterRow,
    MatLabel,
    MatSlideToggle,
  ],
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
