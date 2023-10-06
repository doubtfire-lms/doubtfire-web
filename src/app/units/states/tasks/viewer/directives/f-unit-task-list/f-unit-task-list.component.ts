import { Component, Input, OnInit } from '@angular/core';
import { Unit } from 'src/app/api/models/unit';
import { Grade } from 'src/app/api/models/grade';



@Component({
  selector: 'f-unit-task-list',
  templateUrl: './f-unit-task-list.component.html',
  styleUrls: ['./f-unit-task-list.component.scss'],
})
export class FUnitTaskListComponent implements OnInit {
  @Input() unit: Unit;
  @Input() unitTasks: Task[];
  @Input() selectedTaskDef: Task;


  private gradeNames: string[] = Grade.GRADES;

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
