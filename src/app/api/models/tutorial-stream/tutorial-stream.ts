import { Entity } from '../entity';

const KEYS =
  [
    'id',
    'name',
    'abbreviation',
    'activity_type'
  ];


export class TutorialStream extends Entity {
  id: number;
  name: string;
  abbreviation: string;
  activity_type: string;

  toJson(): any {
    return {
      stream: super.toJsonWithKeys(KEYS)
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
