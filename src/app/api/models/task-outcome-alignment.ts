import { Entity } from 'ngx-entity-service';
import { Project, Unit, TaskDefinition, Task } from './doubtfire-model';
import { LearningOutcome } from './learning-outcome';

export class TaskOutcomeAlignment extends Entity {
  public within: Unit | Project;

  public id: number = undefined;
  public description: string;
  public rating: number;
  public learningOutcome: LearningOutcome;
  public taskDefinition: TaskDefinition;
  public task: Task;

  public constructor(within: Unit | Project) {
    super();
    this.within = within;
  }

  public get unit(): Unit {
    if ( this.within instanceof Unit) {
      return this.within;
    } else {
      return this.within.unit;
    }
  }

  public get project(): Project {
    if ( this.within instanceof Project) {
      return this.within;
    }

    return undefined;
  }
}
