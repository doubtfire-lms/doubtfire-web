import { Component, Input, Inject, OnInit } from '@angular/core';
import { gradeService, Task, outcomeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-outcomes-card',
  templateUrl: 'task-outcomes-card.component.html',
  styleUrls: ['task-outcomes-card.component.scss'],
})
export class TaskOutcomeCardComponent implements OnInit {
  @Input() unit: any;
  @Input() task: any;
  
  alignments: any;

  constructor(@Inject(Task) private outcomeService: any, @Inject(outcomeService) private ts: any) {
  }
  ngOnInit(): void {
      this.alignments = this.unit.staffAlignmentsForTaskDefinition(this.task.definition)
      console.log(this)
  }
 
}
