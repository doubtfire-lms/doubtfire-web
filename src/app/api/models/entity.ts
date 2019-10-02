export abstract class Entity {
  constructor(
  ) { }

  public abstract toJson(): any;
  public abstract updateFromJson(data: any): void;

  protected setFromJson(data: any, keys: string[]): void {
    keys.forEach(key => {
      this[key] = data[key];
    });
  }

  /**
   * Gets the unique key which represents the Entity
   * For example, an id: number, or for Task Entity, project ID and task Definition ID.
   *
   * @returns string containing the unique key value
   */
  public abstract get key(): string;

  protected toJsonWithKeys(keys: string[]) {
    let json: Object = {};
    keys.forEach(key => {
      json[key] = this[key];
    });
    return json;
  }
}
