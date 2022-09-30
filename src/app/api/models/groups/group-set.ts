import { Entity, EntityCache, EntityMapping } from 'ngx-entity-service';
import { AppInjector } from 'src/app/app-injector';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';
import { Group, Unit, User } from '../doubtfire-model';


export class GroupSet extends Entity {

  public id: number;
  public name: string;
  public allowStudentsToCreateGroups: boolean = true;
  public allowStudentsToManageGroups: boolean = true;
  public keepGroupsInSameClass: boolean = false;
  public capacity: number;
  public locked: boolean = false;

  public readonly groupsCache: EntityCache<Group> = new EntityCache<Group>();

  public readonly unit: Unit;

  constructor(unit: Unit) {
    super();
    this.unit = unit;
  }

  public toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      group_set: super.toJson(mappingData, ignoreKeys),
    };
  }

  public get groups(): readonly Group[] {
    return this.groupsCache.currentValues;
  }

  public findGroupById(id: number): Group {
    return this.groups.find(grp => grp.id === id);
  }

  public groupCSVUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/group_sets/${this.id}/groups/csv.json`;
  }

  public groupStudentCSVUploadUrl(): string {
    return `${AppInjector.get(DoubtfireConstants).API_URL}/units/${this.unit.id}/group_sets/${this.id}/groups/student_csv.json`;
  }
}
