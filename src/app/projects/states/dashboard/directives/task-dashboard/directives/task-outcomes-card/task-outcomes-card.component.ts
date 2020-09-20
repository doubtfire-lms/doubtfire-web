
import { Component, Input, Inject, SimpleChanges, OnChanges, OnInit } from '@angular/core';
// to add outcomes service provider 
// import { outcomeService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'task-outcomes-card',
  templateUrl: 'task-outcomes-card.component.html'
})
export class TaskOutcomesCardComponent implements OnChanges, OnInit {   
  @Input() task: any; 
  taskDef: any; 
  unit: any; 
  alignments: []; 

  // Calls the parent's constructor, passing in an object
  // that maps all of the form controls that this form consists of.
  constructor() {
    
  }
  ngOnInit(): void {
    this.unit= this.task.unit();
    this.taskDef= this.task.definition;
    this.alignments = this.unit.staffAlignmentsForTaskDefinition(this.taskDef);   
  }  
  //constructor(@Inject(outcomeService) private outcomes: any) {}   
  ngOnChanges(changes: SimpleChanges ) {   
    let change = changes['taskDef.id'];
    let curVal  = JSON.stringify(change.currentValue);
    let prevVal = JSON.stringify(change.previousValue);
    this.alignments = this.unit.staffAlignmentsForTaskDefinition(this.taskDef);  
}
}
