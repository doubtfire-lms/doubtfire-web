import { Entity } from "./entity";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import API_URL from "../../config/constants/apiURL";

const CACHE_SIZE = 1;

// TODO: HEADERDOC
export abstract class EntityService<T extends Entity>  {

  protected abstract readonly baseEndpoint: string;

  private _cache: Map<string, Observable<T>>;

  constructor(private httpClient: HttpClient) {
    this._cache = new Map<string, Observable<T>>();
  }

  protected abstract endpoint(item: T): string;
  protected abstract endpoint(key: string): string;

  protected abstract createInstanceFrom(json: any): T;

  /**
   * Gets the unique key for an entity of type @class Entity.
   * This is used to identify the object within a cache.
   *
   * @param json The json object to get the key from
   * @returns string containing the unique key value
   */
  public abstract keyForJson(json: any): string;

  // private updateCacheWithEntity(item: any, newValue: any): T;
  private updateCacheWithEntity(item: T, newValue: any): T {
    item.updateFromJson(newValue);              // update from json
    if (this._cache.has(item.key)) {           // if it is in the cache
      this._cache.get(item.key).pipe(map(data => ({ ...data, item })));
    } else {           // if it is not in the cache
      this._cache.set(item.key, Observable.create((obs) => obs.next(item)));          // add it to the cache
    }
    return item;
  }

  private cache(item: T) {
    this._cache.set(item.key, Observable.create((obs) => obs.next(item)));
  }

  // private updateCache(json: Object): T {
  //   const key = this.keyForJson(json);
  //   console.log("Checking cache");
  //   if (this._cache.has(key)) {
  //     let result = this._cache.get(key);   // Get from cache...
  //     console.log("Found, getting from cache to update");
  //     result.updateFromJson(json);         // Update the object... which is in the cache
  //     return result;
  //   } else {
  //     let result = this.createInstanceFrom(json); // Create a new object
  //     this._cache.set(key, result);               // Save in cache
  //     console.log("Saving to cache");
  //     return result;
  //   }
  // }

  // public create(item: T, endpoint: string): Observable<T> {
  //   return this.httpClient.post<T>(`${API_URL}/${endpoint}`, item.toJson())
  //     .pipe(
  //       map(data => this.updateCacheWithEntity(item, data)),
  //       shareReplay(CACHE_SIZE));
  // }


  // updateCache(item: T) {
  //   if (!this._cache.has(item.key)) {
  //     this._cache.set(item.key, this.fetch(endpoint)
  //       .pipe(shareReplay(CACHE_SIZE)));
  //   }
  //   return this._cache.get(key);
  // }


  // CREATING
  public create(item: T): Observable<T> {
    const result = this.requestCreateEntity(item, this.endpoint(item))
      .pipe(shareReplay(CACHE_SIZE));
    this._cache.set(item.key, result);
    return result;
  }

  private requestCreateEntity(item: T, endpoint: string): Observable<T> {
    return this.httpClient.post(`${API_URL}/${endpoint}`, item.toJson())
      .pipe(map(rawData => this.createInstanceFrom(rawData)));   // Turn the raw JSON returned into the object T
  }


  // UPDATING
  // This is wrong, if in cache just update cache value...
  public update(item: T): Observable<T> {
    const result = this.requestPutEntity(item, this.endpoint(item))
      .pipe(shareReplay(CACHE_SIZE));
    this._cache.set(item.key, result);
    return result;
  }

  private requestPutEntity(item: T, endpoint: string): Observable<T> {
    return this.httpClient.put(`${API_URL}/${endpoint}`, item.toJson())
      .pipe(map(rawData => this.createInstanceFrom(rawData)));   // Turn the raw JSON returned into the object T
  }

  // GETTING

  // TODO: Think about the fact that getting user may hit the old user in cache over and over.
  // Maybe need timeout?
  protected getWithKey(key: string): Observable<T> {
    if (!this._cache.has(key)) {
      this._cache.set(key, this.requestGetEntity(this.endpoint(key))
        .pipe(shareReplay(CACHE_SIZE)));
    }
    return this._cache.get(key);
  }

  public get(id: number): Observable<T> {
    return this.getWithKey(id.toString());
  }

  private requestGetEntity(endpoint: string): Observable<T> {
    return this.httpClient.get(`${API_URL}/${endpoint}`)
      .pipe(map(rawData => this.createInstanceFrom(rawData)));  // Turn the raw JSON returned into the object T
  }

  // GET ALL
  public list(): Observable<T | T[]> {
    return this.requestListEntities(this.baseEndpoint)
      .pipe(shareReplay(CACHE_SIZE));
  }

  private requestListEntities(endpoint: string): Observable<T[]> {
    return this.httpClient.get(`${API_URL}/${endpoint}`)
      .pipe(map(rawData => this.convertAndCacheData(rawData)));
  }

  // DELETE ALL
  // TODO: Only delete if successfully deleted
  public delete(item: T) {
    const result = this.requestDeleteEntity(item)
      .pipe(shareReplay(CACHE_SIZE));
    if (this._cache.has(item.key)) {
      this._cache.delete(item.key);
    }
    return result;
  }

  private requestDeleteEntity(item: T): Observable<T> {
    return this.httpClient.delete(`${API_URL}/${this.endpoint(item)}`)
      .pipe(map(rawData => this.createInstanceFrom(rawData)));
  }

  private convertAndCacheData(collection: any): T[] {
    return collection.map((data: any) => {
      let result = this.createInstanceFrom(data);
      this.cache(result);
      return result;
    });
  }
}
