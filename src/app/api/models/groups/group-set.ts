import { Entity } from 'ngx-entity-service';
import { User } from '../doubtfire-model';


export class GroupSet extends Entity {

  public id: number;
  public name: string;
  public allowStudentsToCreateGroups: boolean;
  public allowStudentsToManageGroups: boolean;
  public keepGroupsInSameClass: boolean;
  public capacity: number;
  public locked: boolean;

}
