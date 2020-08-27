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

  /**
   * Gets the url for this webcal relative to an api base url.
   */
  public getUrl(apiBaseUrl: string): string{
    return `${apiBaseUrl}/webcal/${this.id}`;
  }  

  //#region Abstract members of Entity
  toJson(): any {
    return {
      webcal: super.toJsonWithKeys(KEYS)
    };
  }

  public updateFromJson(data: any): void {
    this.setFromJson(data, KEYS);
  }

  public get key(): string {
    return this.id;
  }

  public keyForJson(json: any): string {
    return json.id;
  }
  //#endregion
}
