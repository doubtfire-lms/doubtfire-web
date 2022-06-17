import { Entity } from 'ngx-entity-service';
import { GroupSet, Project, Tutorial } from '../doubtfire-model';


export class Group extends Entity {

  public id: number;
  public name: string;
  public groupSet: GroupSet;
  public tutorial: Tutorial;

  public get projects(): Project[] {
    return [];
  }
}
