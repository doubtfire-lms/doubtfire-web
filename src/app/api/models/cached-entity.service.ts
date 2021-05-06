import { EntityService, HttpOptions } from './entity.service';
import { Entity } from './entity';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

/**
 * The CachedEntityService provides wraps the EntityService and provides a cache that stores
 * previously fetched entity objects from the server. Objects within the cache are updated when
 * new values are fetched from the server.
 */
@Injectable()
export abstract class CachedEntityService<T extends Entity> extends EntityService<T> {
  private globalCache: Map<string, T> = new Map<string, T>();
  private cache: Map<string, T> = this.globalCache;

  /**
   * This allows you to specify the source of a cache, which may change from a global source to
   * a cache contained within another entity (for example, a cache of comments in a task).
   *
   * @param source  the new source to be used for the cache. The global cache will be used if
   *                this is null or undefined.
   */
  public set cacheSource(source: Map<string, T>) {
    if (source) {
      this.cache = source;
    } else {
      this.cache = this.globalCache;
    }
  }

  /**
   * This function is used to map the path ids to a unique key to locate the associated entity
   * within the cache.
   *
   * @param pathIds the pathIds used to determine the key
   * @returns       a unique key to identify the associated entity
   */
  private keyFromPathIds(pathIds: any): string {
    if (pathIds.key) {
      return pathIds.key;
    } else if (typeof pathIds === 'object') {
      return pathIds['id'].toString();
    } else if (typeof pathIds === 'number') {
      return pathIds.toString();
    } else {
      return pathIds;
    }
  }

  /**
   * Make an update request to the endpoint, using the supplied object to identify which id to update.
   * If updated, the cache is updated ot set with the entity.
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   */
  public update(pathIds: object | T, obj?: T, options?: HttpOptions): Observable<T>;
  public update(pathIds: any, obj?: T, options?: HttpOptions): Observable<T> {
    return super
      .update(pathIds, obj, options)
      .pipe(tap((updatedEntity) => this.addEntityToCache(updatedEntity.key, updatedEntity)));
  }
  /**
   * Make a query request (get all) to the end point, using the supplied parameters to determine path.
   * Caches all returned entities
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param other   Any other data that is needed to be passed to the creation of entities
   *                resulting from this get request.
   * @param options Optional http options
   * @returns {Observable} a new cold observable
   */
  public query(pathIds?: object, other?: object, options?: HttpOptions): Observable<T[]> {
    return super.query(pathIds, other, options).pipe(
      tap((entityList) => {
        entityList.forEach((entity) => {
          this.addEntityToCache(entity.key, entity);
        });
      })
    );
  }

  /**
   * First, tries to retrieve from cache, the object with the id, or id field from the pathIds.
   * If found, return the item from cache, otherwise make a get request to the end point,
   * using the supplied parameters to determine path. Caches the returned object
   *
   * @param pathIds Either the id, if a number and maps simple to ':id', otherwise an object
   *                with keys the match the placeholders within the endpointFormat string.
   * @param other   Any other data that is needed to be passed to the creation of entities
   *                resulting from this get request.
   * @param options Optional http options
   */
  public fetch(pathIds: number | string | Entity | object, other?: any, options?: HttpOptions): Observable<T>;
  public fetch(pathIds: any, other?: any, options?: HttpOptions): Observable<T> {
    const key: string = this.keyFromPathIds(pathIds);
    return super.get(pathIds, other, options).pipe(
      map((entity: T) => {
        if (this.hasEntityInCache(key)) {
          const cachedEntity = this.cache.get(key);
          Object.assign(cachedEntity, entity);
          return cachedEntity;
        } else {
          this.addEntityToCache(key, entity);
          return entity;
        }
      })
    );
  }

  /**
   * Checks if an entity exists for a given key within the current cache.
   *
   * @param key Key of entity to check for.
   * @returns true if the entity with key is in the cache
   */
  public hasEntityInCache(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Store an entity in the cache - this will automatically be called on
   * query and get, but can be called directly in special cases.
   *
   * @param key key of the entity to store
   * @param entity the entity object to store in the cache
   */
  public addEntityToCache(key: string, entity: T) {
    this.cache.set(key, entity);
  }

  /**
   * Read a given entity from the cache without interaction with the server.
   *
   * @param key key of entity to read from cache
   */
  public getFromCache(key: string): T {
    return this.cache.get(key);
  }

  /**
   * First, tries to retrieve from cache, the object with the id, or id field from the pathIds.
   * If found, return the item from cache, otherwise make a get request to the end point,
   * using the supplied parameters to determine path. Caches the returned object
   *
   * @param pathIds Either the id, if a number and maps simple to ':id', otherwise an object
   *                with keys the match the placeholders within the endpointFormat string.
   * @param other   Any other data that is needed to be passed to the creation of entities
   *                resulting from this get request.
   * @param options Optional http options
   */
  public get(pathIds: number | string | object, other?: any, options?: HttpOptions): Observable<T>;
  public get(pathIds: any, other?: any, options?: HttpOptions): Observable<T> {
    const key: string = this.keyFromPathIds(pathIds);
    if (this.cache.has(key)) {
      return new Observable((observer: any) => observer.next(this.getFromCache(key)));
    } else {
      return super.get(pathIds, other, options).pipe(tap((entity: T) => this.addEntityToCache(entity.key, entity)));
    }
  }

  /**
   * Make a create request to the endpoint, using the supplied parameters to determine the path.
   * The results of the request are cached using the key of the entity.
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param data    A FormData or object with the values to pass up in the body of the update/put request.
   * @param other   Any other data needed to be passed to the entity on creation
   * @param options Optional http options
   * @returns {Observable} a new cold observable with the newly created @type {T}
   */
  public create(pathIds?: object, data?: FormData | object, other?: any, options?: HttpOptions): Observable<T> {
    return super.create(pathIds, data, other, options).pipe(tap((entity) => this.addEntityToCache(entity.key, entity)));
  }

  /**
   * Make a delete request to the end point, using the supplied parameters to determine path.
   * If deleted, the object is removed from the cache.
   *
   * @param pathIds Either the id, if a number and maps simple to ':id', otherwise an object
   *                with keys the match the placeholders within the endpointFormat string.
   * @param options Optional http options
   */
  public delete(pathIds: number | object, options?: HttpOptions): Observable<object>;
  public delete(pathIds: any, options?: HttpOptions): Observable<object> {
    const key: string = this.keyFromPathIds(pathIds);

    const cache = this.cache;

    return super.delete(pathIds, options).pipe(
      // Tap performs a side effect on Observable, but return it identical to the source.
      tap((response: object) => {
        if (cache.has(key)) {
          cache.delete(key);
        }
      })
    );
  }
}
