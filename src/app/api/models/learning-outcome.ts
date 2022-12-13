import { Entity } from 'ngx-entity-service';


export class LearningOutcome extends Entity {

  id: number;
  iloNumber: number;
  abbreviation: string;
  name: string;
  description: string;

}
