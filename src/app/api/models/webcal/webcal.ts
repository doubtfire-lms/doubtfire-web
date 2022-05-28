import { Entity, EntityMapping } from 'ngx-entity-service';

export class Webcal extends Entity {
  enabled: boolean;
  id: number;
  guid: string;
  includeStartDates: boolean;
  userId: number;
  reminder: {
    time: number;
    unit: string;
  };
  unitExclusions: number[];

  // Used only when updating the webcal. Never returned from the API.
  shouldChangeGuid?: boolean;

  public override toJson<T extends Entity>(mappingData: EntityMapping<T>, ignoreKeys?: string[]): object {
    return {
      webcal: super.toJson(mappingData, ignoreKeys),
    };
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
