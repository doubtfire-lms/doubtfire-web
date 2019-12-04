import { Component, OnInit, Inject, Input } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'task-assessment-modal',
  templateUrl: './task-assessment-modal.component.html',
  styleUrls: ['./task-assessment-modal.component.scss'],
})
export class TaskAssessmentModalComponent implements OnInit {
  @Input() task: any;

  constructor(
    private modal: NzModalRef,
    @Inject(alertService) private alerts: any, ) { }

  ngOnInit() {
  }

  closeModal() {
    this.modal.destroy();
  }

}
