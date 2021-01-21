import { Component, Input } from '@angular/core';

@Component({
    selector: 'task-outcomes-card1',
    templateUrl: 'task-outcomes-card1.component.html',
    styleUrls: ['task-outcomes-card1.component.scss'],
})
export class TaskOutcomesCard1Component {
    @Input() taskDef: any;
    @Input() unit: any;

    currentTaskDef: any;
    alignments: any;

    constructor() { }

    ngDoCheck() {
        if (this.currentTaskDef != this.taskDef) {
            this.currentTaskDef = this.taskDef;
            this.alignments = this.unit.staffAlignmentsForTaskDefinition(this.taskDef);
        }
    }
}
