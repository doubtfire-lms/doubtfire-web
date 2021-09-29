import { Entity } from '../../entity';

const KEYS =
  [
    'id',
    'name',
    'tag',
  ];

export class OverseerImage extends Entity {
  id: number;
  name: string;
  tag: string;

  toJson(): any {
    return {
      overseer_image: super.toJsonWithKeys(KEYS)
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

  public get description(): string {
    return `${this.name} (${this.tag})`
  }
}
