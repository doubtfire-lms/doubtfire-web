import { Component, Input, OnInit } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';

@Component({
  selector: 'f-unit-task-list',
  templateUrl: './f-unit-task-list.component.html',
  styleUrls: ['./f-unit-task-list.component.scss'],
})
export class FUnitTaskListComponent implements OnInit {
  @Input() unit: Unit;
  @Input() unitTasks: Task[];
  @Input() selectedTaskDef: Task;

  constructor() {}

  ngOnInit(): void {
    console.log(this.unit);
    console.log(this.selectedTaskDef);
  }

  setSelectedTask(task: Task) {
    console.log(task);
    this.selectedTaskDef = task;
  }
}
