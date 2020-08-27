import { Entity } from '../entity';

const KEYS =
  [
    'id',
    'include_start_dates',
    'user_id',
  ];

export class Webcal extends Entity {
  id: number;
  include_start_dates: Date;
  user_id: number;

  toJson(): any {
    return {
      webcal: super.toJsonWithKeys(KEYS)
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

  public getUrl(apiBaseUrl: string): string{
    return `${apiBaseUrl}/webcal/${this.id}`;
  }  
}
