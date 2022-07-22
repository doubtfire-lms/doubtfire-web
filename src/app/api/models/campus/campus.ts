import { Entity, EntityMapping } from "ngx-entity-service";

type campusModes = 'timetable' | 'automatic' | 'manual';

export class Campus extends Entity {
  id: number;
  name: string;
  mode: campusModes;
  abbreviation: string;

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      campus: super.toJson(mappingData, ignoreKeys)
    };
  }

  /**
   * Does the campus match the passed in text?
   * Used in filters.
   * @param matchText the text to match
   */
  public matches(matchText: string): boolean {
    return this.name.toLowerCase().indexOf(matchText) >= 0 || this.abbreviation.toLowerCase().indexOf(matchText) >= 0;
  }
}
