import { Entity } from 'ngx-entity-service';
import { Unit, Tutorial } from '../doubtfire-model';

export class TutorialStream extends Entity {
  name: string;
  abbreviation: string;
  activityType: string;

  public override get key(): string {
    return this.abbreviation;
  }

  public get description(): string {
    return `${this.abbreviation}: ${this.name}`;
  }

  public tutorialsIn(unit: Unit): Tutorial[] {
    return unit.tutorials.filter((tutorial) => tutorial.tutorialStream === this);
  }
}
