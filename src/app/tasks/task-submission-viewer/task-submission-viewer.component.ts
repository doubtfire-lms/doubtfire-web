import { Component, OnInit, Input, SimpleChanges, Inject} from '@angular/core';
import { TaskFeedback } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'app-task-submission-viewer',
  templateUrl: './task-submission-viewer.component.html',
  styleUrls: ['./task-submission-viewer.component.scss']
})

export class TaskSubmissionViewerComponent implements OnInit {
  @Input() project: any;
  @Input() task: any;

  taskUrl: string;
  taskFilesUrl: string;
  
  constructor(
    @Inject(TaskFeedback) private TaskFeedback: any
  ) { }

  ngOnInit(): void {
  }

  notSubmitted(task): boolean {
    return (!task.has_pdf && (!task.processing_pdf))
  }

  ngOnChanges(changes: SimpleChanges): void {
    let newTask = changes.task.currentValue;
    newTask.getSubmissionDetails();
    this.taskUrl = this.TaskFeedback.getTaskUrl(newTask);
    this.taskUrl = this.TaskFeedback.getTaskFilesUrl(newTask);
  }
}
