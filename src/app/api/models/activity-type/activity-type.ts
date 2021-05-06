import { Entity } from '../entity';

const KEYS =
  [
    'id',
    'name',
    'abbreviation',
  ];

export class ActivityType extends Entity {
  id: number;
  name: string;
  abbreviation: string;

  toJson(): any {
    return {
      activity_type: super.toJsonWithKeys(KEYS)
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
