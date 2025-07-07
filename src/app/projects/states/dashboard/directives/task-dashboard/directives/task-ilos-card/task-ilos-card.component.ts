import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {LearningOutcome} from 'src/app/api/models/learning-outcome';
import {Project} from 'src/app/api/models/project';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-ilos-card',
  templateUrl: './task-ilos-card.component.html',
  styleUrls: ['./task-ilos-card.component.scss'],
})
export class TaskIlosCardComponent implements OnInit, OnChanges {
  @Input() iloContextType: 'Unit' | 'TaskDefinition' | 'Course' | 'Global';
  @Input() unit: Unit | undefined;
  @Input() taskDef: TaskDefinition | undefined;
  @Input() project: Project;

  learningOutcomes: LearningOutcome[] = [];

  public ngOnChanges(_changes: SimpleChanges) {
    this.getIlos();
  }

  public ngOnInit(): void {
    this.getIlos();
  }

  private getIlos() {
    this.learningOutcomes = [];

    if (this.iloContextType === 'Unit' && this.unit) {
      for (const ilo of this.unit.ilos) {
        this.learningOutcomes.push(ilo);
      }
    } else if (this.iloContextType === 'TaskDefinition' && this.taskDef) {
      this.taskDef.learningOutcomesCache.values.subscribe((ilos) => {
        for (const ilo of ilos) {
          this.learningOutcomes.push(ilo);
        }
      });
    }

    // TODO: implement Course and Global learning outcomes when available
  }

  public getIloContextLabel(): string {
    switch (this.iloContextType) {
      case 'TaskDefinition':
        return 'Task';
      case 'Unit':
        return 'Unit';
      case 'Course':
        return 'Course';
      case 'Global':
        return 'Global';
      default:
        return 'N/A';
    }
  }
}
