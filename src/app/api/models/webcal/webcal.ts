import { Entity } from '../entity';

const KEYS =
  [
    'id',
    'include_start_dates',
    'user_id',
  ];

export class Webcal extends Entity {

  id: string;
  include_start_dates: Date;
  user_id: number;

  toJson(): any {
    return {
      webcal: super.toJsonWithKeys(KEYS)
    };
  }

  public updateFromJson(data: any) {
    this.setFromJson(data, KEYS);
  }

  public get key(): string {
    return this.id;
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  /**
   * Gets the URL for this Webcal relative to the specified API base URL.
   */
  public getUrl(apiBaseUrl: string): URL {
    const url = new URL(`${apiBaseUrl}/webcal/${this.id}`);
    url.protocol = 'webcal';
    return url;
  }
}
