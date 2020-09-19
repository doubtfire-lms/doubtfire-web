import { Entity } from './entity';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import API_URL from '../../config/constants/apiURL';
import { Injectable } from '@angular/core';

export interface HttpOptions {
  headers?:
    | HttpHeaders
    | {
        [header: string]: string | string[];
      };
  observe?: 'body';
  params?:
    | HttpParams
    | {
        [param: string]: string | string[];
      };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}

/**
 * ResourceService, responsible for the CRUD actions for
 * all resources which inherit form it.
 */
@Injectable()
export abstract class EntityService<T extends Entity> {
  /**
   * Provide a string template for the endpoint URLs in the format
   * 'path/to/:id1:/other/:id2:' where ':id1:' and ':id2:' are placeholders for id values
   * passed into the CRUD methods.
   *
   * Use :id for simple cases eg: 'users/:id:'. This can then be shortcut to provide just the
   * value without needing to indicate the key to replace. eg UserService.get(1) instead of
   * UserService.get({id: 1}])
   * @returns {string} The endpoint string format
   */
  protected abstract readonly endpointFormat: string;

  abstract entityName: string;
  get serverKey(): string {
    return this.entityName
      .replace(/(.)([A-Z][a-z]+)/, '$1_$2')
      .replace(/([a-z0-9])([A-Z])/, '$1_$2')
      .toLowerCase();
  }

  constructor(private httpClient: HttpClient) {}

  /**
   * Helper function to convert end point format strings to final path
   *
   * @param path the end point format string with id placeholders
   * @param object the object to get id values from for the placeholder.
   * @returns {string} The endpoint.
   */
  private buildEndpoint(path: string, object?: object): string {
    // Replace any keys with provided values
    if (object) {
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          // If the key is undefined, just replace with an empty string.
          path = path.replace(`:${key}:`, object[key] ? object[key] : '');
        }
      }
    }

    // Strip any missed keys
    path = path.replace(/:[\w-]*?:/, '');
    return `${API_URL}/${path}`;
  }

  /**
   * Convert accepted data to @class Entity object
   *
   * @param json The json data to convert to T
   */
  protected abstract createInstanceFrom(json: any, other?: any): T;

  /**
   * Make a get request to the end point, using the supplied parameters to determine path.
   *
   * @param pathIds Either the id, if a number and maps simple to ':id', otherwise an object
   *                with keys the match the placeholders within the endpointFormat string.
   * @param other   Any other data that is needed to be passed to the creation of entities
   *                resulting from this get request.
   * @param options Optional http options
   */
  public get(pathIds: number | object, other?: any, options?: HttpOptions): Observable<T>;
  public get(pathIds: any, other?: any, options?: HttpOptions): Observable<T> {
    const object = { ...pathIds };
    if (typeof pathIds === 'number') {
      object['id'] = pathIds;
    }
    const path = this.buildEndpoint(this.endpointFormat, object);

    return this.httpClient.get(path, options).pipe(map((rawData) => this.createInstanceFrom(rawData, other))); // Turn the raw JSON returned into the object T
  }

  /**
   * Make a query request (get all) to the end point, using the supplied parameters to determine path.
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   * @returns {Observable} a new cold observable
   */
  public query(pathIds?: object, options?: HttpOptions): Observable<T[]> {
    const path = this.buildEndpoint(this.endpointFormat, pathIds);
    return this.httpClient
      .get(path, options)
      .pipe(map((rawData) => this.convertCollection(rawData instanceof Array ? rawData : [rawData])));
  }

  /**
   * Make an update request to the endpoint, using the supplied object to identify which id to update.
   *
   * @param obj An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   */
  public update(obj: T, options?: HttpOptions): Observable<T> {
    return this.put<object>(obj, options).pipe(
      map((rawData) => {
        obj.updateFromJson(rawData);
        return obj;
      })
    );
  }

  /**
   * Make an put request to the endpoint, indicating the type of data to be returned from the endpoint.
   * The supplied object identifies the endpoint url and data.
   *
   * @typeparam S The type of the data to be returned
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   */
  public put<S>(pathIds: object, options?: HttpOptions): Observable<S>;
  public put<S>(pathIds: any, options?: HttpOptions): Observable<S> {
    const object = { ...pathIds };
    const json = typeof pathIds === 'object' ? pathIds.toJson() : pathIds;
    const path = this.buildEndpoint(this.endpointFormat, object);

    return this.httpClient.put(path, json, options) as Observable<S>;
  }

  /**
   * Make a create request to the endpoint, using the supplied parameters to determine the path.
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param other   Any other data needed to be passed to the entity on creation
   * @param options Optional http options
   * @returns {Observable} a new cold observable with the newly created @type {T}
   */
  public create(pathIds?: object, other?: any, options?: HttpOptions): Observable<T>;
  public create(pathIds?: any, other?: any, options?: HttpOptions): Observable<T> {
    const object = { ...pathIds };
    const json = typeof pathIds.toJson === 'function' ? pathIds.toJson() : pathIds;
    const path = this.buildEndpoint(this.endpointFormat, object);
    return this.httpClient.post(path, json, options).pipe(map((rawData) => this.createInstanceFrom(rawData, other)));
  }

  /**
   * Make a delete request to the end point, using the supplied parameters to determine path.
   *
   * @param pathIds Either the id, if a number and maps simple to ':id', otherwise an object
   *                with keys the match the placeholders within the endpointFormat string.
   * @param other   Any other data that is needed to be passed to entities created from
   *                this delete request.
   * @param options Optional http options
   */
  public delete(pathIds: number | object, other?: any, options?: HttpOptions): Observable<T>;
  public delete(pathIds: any, other?: any, options?: HttpOptions): Observable<T> {
    const object = { ...pathIds };
    if (typeof pathIds === 'number') {
      object['id'] = pathIds;
    }
    const path = this.buildEndpoint(this.endpointFormat, object);

    return this.httpClient.delete(path, options).pipe(map((rawData) => this.createInstanceFrom(rawData, other)));
  }

  /**
   * Instantiates an array of elements as objects from the JSON returned
   * from the server.
   * @returns {T[]} The array of Objects
   */
  private convertCollection(collection: any, other?: any): T[] {
    return collection.map((data: any) => this.createInstanceFrom(data, other));
  }

  /**
   * Gets the unique key for an entity of type @class Entity.
   * This is used to identify the object within a cache.
   *
   * @param json The json object to get the key from
   * @returns string containing the unique key value
   */
  public abstract keyForJson(json: any): string;
}
