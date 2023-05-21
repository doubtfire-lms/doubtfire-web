import { Component, Input } from '@angular/core';

@Component({
  selector: 'f-task-sheet-view',
  templateUrl: './task-sheet-view.component.html',
  styleUrls: ['./task-sheet-view.component.scss']
})
export class TaskSheetViewComponent {
  @Input() taskDef: any = null;
  @Input() unit: string = '';

  hasPdf = false;
  urls = {
    taskPdfUrl: ''
  };

  constructor() {}

  clearSelectedTask(): void {
    this.taskDef = null;
  }

  ngOnInit(): void {
    if (this.taskDef) {
      this.hasPdf = this.taskDef.hasTaskSheet;
      this.urls.taskPdfUrl = this.taskDef.getTaskPDFUrl();
    }
  }

  ngOnChanges(): void {
    this.ngOnInit();
  }
}
