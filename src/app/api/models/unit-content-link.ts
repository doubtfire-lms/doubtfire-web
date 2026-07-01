import {Entity} from 'ngx-entity-service';
import type {Unit} from './unit';

export type UnitContentContextType = 'grade' | 'grade_overview' | 'task_definition';

export class UnitContentSite {
  id: number;
  unitId: number;
  name: string;
  originalFilename: string;
  rootDir: string;
  rootDirOptions: string[];
  isMain: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(json?: Partial<UnitContentSite>) {
    Object.assign(this, json);
  }
}

export class UnitContentLink extends Entity {
  id?: number;
  unit: Unit;
  unitId?: number;
  unitContentSiteId: number;
  contextType: UnitContentContextType;
  contextKey: string;
  route: string;
  site?: UnitContentSite;

  constructor(unit?: Unit) {
    super();
    this.unit = unit;
  }
}
