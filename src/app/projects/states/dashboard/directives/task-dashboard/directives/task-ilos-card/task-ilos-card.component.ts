import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {LearningOutcome} from 'src/app/api/models/learning-outcome';
import {Project} from 'src/app/api/models/project';
import {TaskDefinition} from 'src/app/api/models/task-definition';
import {Unit} from 'src/app/api/models/unit';

@Component({
  selector: 'f-task-ilos-card',
  templateUrl: './task-ilos-card.component.html',
  styleUrls: ['./task-ilos-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TaskIlosCardComponent implements OnInit, OnChanges {
  @Input() iloContextType: 'Unit' | 'TaskDefinition' | 'Course' | 'Global';
  @Input() unit: Unit | undefined;
  @Input() taskDef: TaskDefinition | undefined;
  @Input() project: Project;

  allOutcomesCache: LearningOutcome[] = []; // Track linked outcomes
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
      this.addIlosToCache(this.unit.ilos as LearningOutcome[]);
      this.learningOutcomes.push(...this.unit.ilos);
    } else if (this.iloContextType === 'TaskDefinition' && this.taskDef) {
      this.addIlosToCache(this.taskDef.unit.ilos as LearningOutcome[]);
      this.taskDef.learningOutcomesCache.values.subscribe((ilos) => {
        this.learningOutcomes.push(...ilos);
        this.addIlosToCache(ilos);
      });
    }

    // TODO: implement Course and Global learning outcomes when available
  }

  private addIlosToCache(outcomes: LearningOutcome[]): void {
    for (const ilo of outcomes) {
      if (!this.allOutcomesCache.find((existing) => existing.id === ilo.id)) {
        this.allOutcomesCache.push(ilo);
      }
    }
  }

  getLinkedOutcomes(ilo: LearningOutcome): LearningOutcome[] {
    return this.allOutcomesCache.filter((outcome) => ilo.linkedOutcomeIds.includes(outcome.id));
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
