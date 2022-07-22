import { Entity, EntityMapping } from 'ngx-entity-service';

export class ActivityType extends Entity {
  id: number;
  name: string;
  abbreviation: string;

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      activity_type: super.toJson(mappingData, ignoreKeys)
    };
  }
}
