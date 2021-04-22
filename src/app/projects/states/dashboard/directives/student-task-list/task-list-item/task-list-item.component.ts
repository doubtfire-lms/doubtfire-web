import { Component, Input, OnInit, Inject } from '@angular/core';
import { gradeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-list-item',
  templateUrl: 'task-list-item.component.html',
  styleUrls: ['task-list-item.component.scss'],
})
export class TaskListItemComponent implements OnInit {
  @Input() task: any;
  @Input() setSelectedTask: any;
  @Input() isSelectedTask: any;

  public gradeNames: string[];

  constructor(@Inject(gradeService) private gs: any) {}

  ngOnInit() {
    // Expose grade service names
    this.gradeNames = this.gs.grades;
  }
}
