import { Entity } from 'ngx-entity-service';


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
}
