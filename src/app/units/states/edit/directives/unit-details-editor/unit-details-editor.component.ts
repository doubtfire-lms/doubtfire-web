import {OverseerImage, UnitService} from 'src/app/api/models/doubtfire-model';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {TeachingPeriod} from 'src/app/api/models/teaching-period';
import {Unit} from 'src/app/api/models/unit';
import {TaskDefinitionService} from 'src/app/api/services/task-definition.service';
import {TeachingPeriodService} from 'src/app/api/services/teaching-period.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {TaskSubmissionService} from 'src/app/common/services/task-submission.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {Component, Input, OnInit} from '@angular/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {D2lUnitDetailsModal} from './d2l-details-form/d2l-unit-details-form.component';

@Component({
  selector: 'f-unit-details-editor',
  templateUrl: 'unit-details-editor.component.html',
  styleUrls: ['unit-details-editor.component.scss'],
  standalone: false,
})
export class UnitDetailsEditorComponent implements OnInit {
  @Input() unit: Unit;

  constructor(
    private teachingPeriodService: TeachingPeriodService,
    private taskDefinitionService: TaskDefinitionService,
    private doubtfireConstants: DoubtfireConstants,
    private taskSubmissionService: TaskSubmissionService,
    private d2lUnitDetailsModal: D2lUnitDetailsModal,
    private unitService: UnitService,
    private alertsService: AlertService,
    private confirmationModal: ConfirmationModalService,
  ) {}

  public teachingPeriods: TeachingPeriod[];
  public taskDefinitions: TaskDefinition[];
  public dockerImages: OverseerImage[];

  public get overseerEnabled() {
    return this.doubtfireConstants.IsOverseerEnabled;
  }

  public get d2lEnabled() {
    return this.doubtfireConstants.IsD2LEnabled;
  }

  ngOnInit(): void {
    this.teachingPeriodService.query().subscribe((periods) => {
      this.teachingPeriods = periods;
    });

    this.unit.taskDefinitionCache.values.subscribe((taskDefs) => {
      this.taskDefinitions = taskDefs;
    });

    this.taskSubmissionService.getDockerImagesAsPromise().then((images) => {
      this.dockerImages = images;
    });
  }

  addD2lData() {
    this.d2lUnitDetailsModal.open(this.unit);
  }

  saveUnit() {
    this.unitService.update(this.unit).subscribe({
      next: (_unit) => {
        this.alertsService.success('Unit updated.', 2000);
      },
      error: (response) => {
        this.alertsService.error(`Failed to update unit. ${response}`, 6000);
      },
    });
  }

  private updatingAssessInPortfolio: boolean = false;

  onToggleAssessInPortfolio(event: MatSlideToggleChange) {
    if (!event.checked || this.updatingAssessInPortfolio) {
      return false;
    }

    if (this.updatingAssessInPortfolio) {
      return;
    }

    this.updatingAssessInPortfolio = true;

    setTimeout(() => {
      this.unit.markLateSubmissionsAsAssessInPortfolio = false;
      const modal = this.confirmationModal.show(
        'Enable Assess in Portfolio?',
        `Are you sure you want to enable "Assess in Portfolio" for late submissions?
        This will update any existing Time Exceeded tasks to the "Assess in Portfolio" state.
        You will not be able to disable this setting while any tasks remain in the "Assess in Portfolio" state.`,
        () => {
          this.unit.markLateSubmissionsAsAssessInPortfolio = true;
          setTimeout(() => {
            this.updatingAssessInPortfolio = false;
          });
        },
      );
      modal.afterClosed().subscribe(() => {
        setTimeout(() => {
          this.updatingAssessInPortfolio = false;
        });
      });
    });
  }
}
