import { EntityService, HttpOptions } from './entity.service';
import { Entity } from './entity';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class CacheableEntityService<T extends Entity> extends EntityService<T> {
  private cache: Map<string, T> = new Map<string, T>();

  /**
   * Make an update request to the endpoint, using the supplied object to identify which id to update.
   * If updated, the cache is updated ot set with the entity.
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   */
  public update(pathIds: object, options?: HttpOptions): Observable<T>;
  public update(pathIds: any, options?: HttpOptions): Observable<T> {
    return super
      .update(pathIds, options)
      .pipe(tap((updatedEntity) => this.addEntityToCache(updatedEntity.key, updatedEntity)));
  }
  /**
   * Make a query request (get all) to the end point, using the supplied parameters to determine path.
   * Caches all returned entities
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   * @returns {Observable} a new cold observable
   */
  public query(pathIds?: object, options?: HttpOptions): Observable<T[]> {
    return super.query(pathIds, options).pipe(
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
   * @param options Optional http options
   */
  public fetch(pathIds: number | string | object, options?: HttpOptions): Observable<T>;
  public fetch(pathIds: any, options?: HttpOptions): Observable<T> {
    let key: string;
    if (typeof pathIds === 'object') {
      key = pathIds['id'];
    } else if (typeof pathIds === 'number') {
      key = pathIds.toString();
    } else {
      key = pathIds;
    }
    return super.get(pathIds, options).pipe(
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
   * @param options Optional http options
   */
  public get(pathIds: number | string | object, options?: HttpOptions): Observable<T>;
  public get(pathIds: any, options?: HttpOptions): Observable<T> {
    let key: string;
    if (typeof pathIds === 'object') {
      key = pathIds['id'];
    } else if (typeof pathIds === 'number') {
      key = pathIds.toString();
    } else {
      key = pathIds;
    }
    if (this.cache.has(key)) {
      return new Observable((observer: any) => observer.next(this.getFromCache(key)));
    } else {
      return super.get(pathIds, options).pipe(tap((entity: T) => this.addEntityToCache(entity.key, entity)));
    }
  }

  /**
   * Make a create request to the endpoint, using the supplied parameters to determine the path.
   * The results of the request are cached using the key of the entity.
   *
   * @param pathIds An object with keys which match the placeholders within the endpointFormat string.
   * @param options Optional http options
   * @returns {Observable} a new cold observable with the newly created @type {T}
   */
  public create(pathIds?: object, options?: HttpOptions): Observable<T> {
    return super.create(pathIds, options).pipe(tap((entity) => this.addEntityToCache(entity.key, entity)));
  }

  /**
   * Make a delete request to the end point, using the supplied parameters to determine path.
   * If deleted, the object is removed from the cache.
   *
   * @param pathIds Either the id, if a number and maps simple to ':id', otherwise an object
   *                with keys the match the placeholders within the endpointFormat string.
   * @param options Optional http options
   */
  public delete(pathIds: number | object, options?: HttpOptions): Observable<T>;
  public delete(pathIds: any, options?: HttpOptions): Observable<T> {
    return super.delete(pathIds, options).pipe(
      // Tap performs a side effect on Observable, but return it identical to the source.
      tap((deletedEntity) => {
        if (this.cache.has(deletedEntity.key)) {
          this.cache.delete(deletedEntity.key);
        }
      })
    );
  }
}
