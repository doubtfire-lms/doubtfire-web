import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {UIRouter} from '@uirouter/core';
import * as _ from 'lodash';
import {Task} from 'src/app/api/models/task';
import {TaskStatusEnum, TaskStatusUiData} from 'src/app/api/models/task-status';
import {TaskService} from 'src/app/api/services/task.service';
import {ExtensionModalService} from 'src/app/common/modals/extension-modal/extension-modal.service';
import {QrModalService} from 'src/app/common/modals/qr-modal/qr-modal.service';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';
import {SubmissionTypeModalService} from 'src/app/tasks/modals/submission-type-modal/submission-type-modal.service';

import {Project} from 'src/app/api/models/project';
import {UserService} from 'src/app/api/services/user.service';
@Component({
  selector: 'f-task-status-card',
  templateUrl: './task-status-card.component.html',
  styleUrls: ['./task-status-card.component.scss'],
})
export class TaskStatusCardComponent implements OnChanges, AfterViewInit {
  triggers: TaskStatusUiData[];
  textCss: string;
  constructor(
    private extensions: ExtensionModalService,
    private taskService: TaskService,
    private router: UIRouter,
    private qrModalService: QrModalService,
    private doubtfireConstants: DoubtfireConstants,
    private submissionTypeModalService: SubmissionTypeModalService,
    private userService: UserService,
  ) {}

  @Input() task: Task;
  taskStatusColor: string;

  private project?: Project;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task) {
      this.task = changes.task.currentValue;
      this.reapplyTriggers();
      this.taskStatusColor = this.taskService.statusColors.get(this.task.statusClass());
      this.project = this.task.project;
      this.textCss = `::ng-deep f-task-status-card .mat-mdc-text-field-wrapper.mdc-text-field {
        background-color: #${this.taskStatusColor} !important;
      }`;
    }
  }

  ngAfterViewInit(): void {
    document.getElementsByTagName('style')[0].append(this.textCss);
  }

  reapplyTriggers(): void {
    // if tutor is in queryParam
    if (this.router.globals.params.tutor != null) {
      this.triggers = this.taskService.statusKeys.map((k) => this.taskService.statusData(k));
    } else {
      const studentTriggers = _.map(
        this.taskService.switchableStates.student as TaskStatusEnum[],
        (k) => this.taskService.statusData(k),
      );
      const filteredStudentTriggers = this.task.filterFutureStates(studentTriggers);
      this.triggers = filteredStudentTriggers;
      // Ensure the current task's status is in the list
      if (!this.triggers.find((t) => t.status === this.task.status)) {
        this.triggers.push(this.taskService.statusData(this.task.status));
      }
    }
    this.taskService.statusKeys;
  }

  public isReadyForFeedback(): boolean {
    return this.task.status === 'ready_for_feedback';
  }

  public isSubmittedForPortfolio(): boolean {
    return this.task.status === 'assess_in_portfolio';
  }

  triggerTransition(trigger: TaskStatusEnum): void {
    if (trigger === 'ready_for_feedback') {
      this.uploadSubmission();
    } else {
      this.task.triggerTransition(trigger);
    }
  }

  uploadSubmission(): void {
    if (this.task.definition.assessInPortfolioOnly) {
      this.submissionTypeModalService.show(this.task);
    } else {
      this.task.triggerTransition('ready_for_feedback');
    }
  }

  updateFilesInSubmission(): void {
    this.task.presentTaskSubmissionModal(this.task.status, true);
  }

  openDiscussionQrCode(): void {
    const hostName = this.doubtfireConstants.HOST_URL;
    const url = `${hostName}/tutor-discussion?unitId=${this.task.unit.id}&username=${this.userService.currentUser.username}`;
    this.qrModalService.show(
      url,
      'Display this QR code during your class so your tutor can scan it to view your submissions and mark your tasks as complete.',
    );
  }

  applyForExtension(): void {
    this.extensions.show(this.task, () => {
      this.task.refresh();
    });
  }
}
