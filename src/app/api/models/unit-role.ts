import { Entity } from 'ngx-entity-service';
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

}
