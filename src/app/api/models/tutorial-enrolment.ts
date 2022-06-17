import { Entity } from 'ngx-entity-service';
import { Tutorial, User } from './doubtfire-model';


export class TutorialEnrolment extends Entity {
  public tutorial: Tutorial;
}
