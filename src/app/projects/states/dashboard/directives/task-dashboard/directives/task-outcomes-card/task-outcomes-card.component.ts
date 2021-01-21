import { Component, Input } from '@angular/core';

@Component({
    selector: 'task-outcomes-card',
    templateUrl: 'task-outcomes-card.component.html',
    styleUrls: ['task-outcomes-card.component.scss'],
})
export class TaskOutcomesCardComponent {
    @Input() taskDef: any;
    @Input() unit: any;

    currentTaskDef: any;
    alignments: any;

    constructor() { }

    ngDoCheck() {
        if (this.alignments == undefined) {
            this.alignments = [];
        }
        if (this.currentTaskDef != this.taskDef) {
            this.currentTaskDef = this.taskDef;
            this.alignments = this.unit.staffAlignmentsForTaskDefinition(this.taskDef);
        }
    }
}
