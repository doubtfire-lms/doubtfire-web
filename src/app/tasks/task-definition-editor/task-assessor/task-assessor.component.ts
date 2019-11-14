import { Component, OnInit, Input, Inject } from '@angular/core';
import { taskService, Task, alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-assessor',
  templateUrl: './task-assessor.component.html',
  styleUrls: ['./task-assessor.component.scss']
})
export class TaskAssessorComponent implements OnInit {
  @Input() comment: any;
  @Input() task: any;

  constructor(
    @Inject(alertService) private alerts: any,
    @Inject(taskService) private ts: any, ) { }

  private handleError(error: any) {
    this.alerts.add('danger', 'Error: ' + error.data.error, 6000);
  }

  ngOnInit() {
  }
}
