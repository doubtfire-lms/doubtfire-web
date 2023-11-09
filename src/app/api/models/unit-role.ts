import { Entity, EntityMapping } from 'ngx-entity-service';
import { User, Unit } from './doubtfire-model';

/**
 * A unit role represents a academic teaching role within a unit. Linking a user
 * to their role within the unit.
 */
export class UnitRole extends Entity {

  id: number;
  role: string;
  user: User;
  unit: Unit;

  /**
   * The id for updated roles - but we need to move away from this to the role string...
   * @deprecated
   */
  roleId: number;

  /**
   * Compare this unit role against a lowercase text string
   *
   * @param text the lowercase text to match
   * @returns true if this role relates to that text
   */
  public matches(text: string): boolean {
    return this.user.matches(text) || this.unit.matches(text);
  }

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      unit_role: super.toJson(mappingData, ignoreKeys),
    }
  }

}
