import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UIRouter } from '@uirouter/core';
import * as _ from 'lodash';
import { Task } from 'src/app/api/models/task';
import { TaskStatusEnum } from 'src/app/api/models/task-status';
import { TaskService } from 'src/app/api/services/task.service';
import { ExtensionModalService } from 'src/app/common/modals/extension-modal/extension-modal.service';
import { QrModalService } from 'src/app/common/modals/qr-modal/qr-modal.service';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
@Component({
  selector: 'f-task-status-card',
  templateUrl: './task-status-card.component.html',
  styleUrls: ['./task-status-card.component.scss'],
})
export class TaskStatusCardComponent implements OnChanges, AfterViewInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  triggers: any;
  textCss: string;
  constructor(
    private extensions: ExtensionModalService,
    private taskService: TaskService,
    private router: UIRouter,
    private qrModalService: QrModalService,
    private doubtfireConstants: DoubtfireConstants,
  ) {}

  @Input() task: Task;
  taskStatusColor: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.task) {
      this.task = changes.task.currentValue;
      this.reapplyTriggers();
      this.taskStatusColor = this.taskService.statusColors.get(this.task.statusClass());

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
      this.triggers = this.taskService.statusKeys.map(this.taskService.statusData);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const studentTriggers = _.map(this.taskService.switchableStates.student, this.taskService.statusData) as any;
      const filteredStudentTriggers = this.task.filterFutureStates(studentTriggers);
      this.triggers = filteredStudentTriggers;
    }
    this.taskService.statusKeys;
  }

  public isReadyForFeedback(): boolean {
    return this.task.status === 'ready_for_feedback';
  }

  triggerTransition(trigger: TaskStatusEnum): void {
    this.task.triggerTransition(trigger);
  }

  updateFilesInSubmission(): void {
    this.task.presentTaskSubmissionModal(this.task.status, true);
  }

  openDiscussionQrCode(): void {
    const url = `${this.doubtfireConstants.API_URL}/tutor/marking?unitId=${this.task.unit.id}&projectId=${this.task.project.id}`;
    console.log(url);
    this.qrModalService.show(url);
  }

  applyForExtension(): void {
    this.extensions.show(this.task, () => {
      this.task.refresh();
    });
  }
}
