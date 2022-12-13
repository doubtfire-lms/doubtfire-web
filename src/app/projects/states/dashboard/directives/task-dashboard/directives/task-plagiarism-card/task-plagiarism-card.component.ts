import { Component, OnInit, Input, Inject } from '@angular/core';
import { plagiarismReportModal } from 'src/app/ajs-upgraded-providers';
import { Task } from 'src/app/api/models/doubtfire-model';

@Component({
  selector: 'task-plagiarism-card',
  templateUrl: './task-plagiarism-card.component.html',
  styleUrls: ['./task-plagiarism-card.component.scss'],
})
export class TaskPlagiarismCardComponent implements OnInit {
  @Input() task: Task;

  constructor(@Inject(plagiarismReportModal) private plagiarismModal: any) {}

  ngOnInit(): void {}

  viewReport() {
    this.plagiarismModal.show(this.task);
  }
}
