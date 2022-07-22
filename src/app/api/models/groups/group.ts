import { Entity, EntityCache } from 'ngx-entity-service';
import { Unit, GroupSet, Project, Tutorial } from '../doubtfire-model';


export class Group extends Entity {

  public id: number;
  public name: string;
  public groupSet: GroupSet;
  public tutorial: Tutorial;
  public capacityAdjustment: number;
  public locked: boolean;

  public readonly projectsCache: EntityCache<Project> = new EntityCache<Project>();

  public readonly unit: Unit;

  public get projects(): Project[] {
    return this.projectsCache.currentValues;
  }

  public constructor(unit: Unit){
    super();
    this.unit = unit;
  }
}
