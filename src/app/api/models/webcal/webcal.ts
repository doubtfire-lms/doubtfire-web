import { Entity } from '../entity';

const KEYS =
  [
    'id',
    'guid',
    'include_start_dates',
    'user_id',
    'reminder',
    'unit_exclusions',
  ];

export class Webcal extends Entity {

  id: number;
  guid: string;
  include_start_dates: boolean;
  user_id: number;
  reminder: {
    time: number;
    unit: string;
  };
  unit_exclusions: number[];

  toJson(): any {
    return {
      webcal: super.toJsonWithKeys(KEYS)
    };
  }

  public updateFromJson(data: any) {
    this.setFromJson(data, KEYS);
  }

  public get key(): string {
    return this.id.toString();
  }

  public keyForJson(json: any): string {
    return json.id;
  }

  /**
   * Gets the URL for this Webcal relative to the specified API base URL.
   */
  public getUrl(apiBaseUrl: string): URL {
    const url = new URL(`${apiBaseUrl}/webcal/${this.guid}`);
    url.protocol = 'webcal';
    return url;
  }
}
