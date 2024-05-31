import {Injectable} from '@angular/core';
import {RxStorage} from 'ngx-reactive-storage';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private storage = new RxStorage();

  constructor() {}

  // Add
  public setItem(key: string, data: any) {
    return this.storage.set(key, data);
  }

  // Get
  public getItem(key: string) {
    return this.storage.get(key);
  }

  // Delete
  public removeItem(key: string) {
    return this.storage.remove(key);
  }

  // Clear
  public clear() {
    return this.storage.clear();
  }
}
