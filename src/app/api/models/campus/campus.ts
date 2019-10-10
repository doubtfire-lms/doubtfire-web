import { Entity } from '../entity';

const KEYS =
  [
    'id',
    'name',
    'mode',
    'abbreviation',
  ];

type campusModes = 'timetable' | 'automatic' | 'manual';

export class Campus extends Entity {
  id: number;
  name: string;
  mode: campusModes;
  abbreviation: string;

  toJson(): any {
    return {
      campus: super.toJsonWithKeys(KEYS)
    };
  }

  public updateFromJson(data: any): void {
    this.setFromJson(data, KEYS);
  }
  public get key(): string {
    return this.id.toString();
  }
  public keyForJson(json: any): string {
    return json.id;
  }
}

