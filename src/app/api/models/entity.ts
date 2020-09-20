/**
 * A mapping function used to map data into/out of an entity.
 *
 * @param object  The entity object or json to get the data from.
 * @returns       The data used to represent the keyed value from object.
 */
export type TypeMapFunction = (object: any) => any;

/**
 * Entity class is used to represent an object within the main application model. This
 * entity can be transferred to/from the server, and there are functions to assist with
 * copying the object to a data transfer format to send to the server, and functions to
 * assist with updating the object based upon responses from the server.
 *
 * When implementing an Entity you need to:
 * 1: Override @method toJson to convert the entity to json. This can use
 *    @method toJsonWithKeys to indicate the values to copy.
 * 2: Override @method updateFromJson to update the entity with data from a json object.
 *    This is the inverse of @method toJson and can be @method setFromJson.
 * 3: Override @method key to indicate a unique value used to cache the entity
 *    (if/when cached)
 * 4: Implement a EntityService to handle transmission of this object to the server
 *    for CRUD operations.
 */
export abstract class Entity {
  /**
   * Construct an Entity object
   *
   * @param initialData An optional object storing the data to initialise the Entity with, calls @method updateFromJson with the data.
   */
  constructor(initialData?: object) {
    if (initialData) {
      this.updateFromJson(initialData);
    }
  }

  /**
   * Conver the entity object to json.
   *
   * @returns A json representation of the entity.
   */
  public abstract toJson(): any;

  /**
   * Update the current entity from information within the passed in json object.
   *
   * @param data The json object containing the data to copy into the entity.
   */
  public abstract updateFromJson(data: any): void;

  /**
   * Update the entity with data from the passed in json object. This is used when updated
   * details are fetched from the server. This method takes care of copying data by key
   * from the json data to the entity itself.
   *
   * @param data  the new data to be stored within the entity
   * @param keys  the keys of the data to map
   * @param maps  an optional map of functions that are called to translate
   *              specific values from the json where a straight data copy is not
   *              appropriate/possible.
   */
  protected setFromJson(data: any, keys: string[], ignoredKeys?: string[], maps?: object): void {
    keys.forEach((key) => {
      if (maps && maps[key]) {
        this[key] = maps[key](data[key]);
      } else if ((ignoredKeys && ignoredKeys.indexOf(key) < 0) || !ignoredKeys) {
        this[key] = data[key];
      }
    });
  }

  /**
   * Gets the unique key which represents the Entity
   * For example, an id: number, or for Task Entity, project ID and task Definition ID.
   *
   * @returns string containing the unique key value
   */
  public abstract get key(): string;

  /**
   * Copy the data within the entity into a json object and return. This is used when
   * data needs to be copied from the entity and sent to the server. Data is copied from
   * the entity for each of the @param keys which are directly copied from the entity
   * into the json. Where data cannot be directly copied, the @param maps map can be
   * use to provide key based mapping functions to translate the data.
   *
   * @param keys  an optional map of functions that are called to translate
   *              specific values from the entity where a straight data copy is not
   *              appropriate/possible.
   */
  protected toJsonWithKeys(keys: string[], maps?: object): object {
    const json: object = {};
    keys.forEach((key) => {
      if (maps && maps[key]) {
        json[key] = maps[key](this, key);
      } else {
        json[key] = this[key];
      }
    });
    return json;
  }
}
