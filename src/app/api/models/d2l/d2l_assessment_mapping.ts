import {Entity} from 'ngx-entity-service';
import {Unit} from '../unit';

export class D2lAssessmentMapping extends Entity {
  id: number;
  unit: Unit;

  orgUnitId: string;
  gradeObjectId: string;

  constructor(unit: Unit) {
    super();
    this.unit = unit;
  }
}
