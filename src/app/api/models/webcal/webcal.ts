import { Entity } from '../entity';

const KEYS =
  [
    'enabled',
    'id',
    'guid',
    'include_start_dates',
    'user_id',
    'reminder',
    'unit_exclusions',

    // Only used when updating the webcal.
    'should_change_guid',
  ];

export class Webcal extends Entity {

  enabled: boolean;
  id: number;
  guid: string;
  include_start_dates: boolean;
  user_id: number;
  reminder: {
    time: number;
    unit: string;
  };
  unit_exclusions: number[];

  // Used only when updating the webcal. Never returned from the API.
  should_change_guid?: boolean;

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
