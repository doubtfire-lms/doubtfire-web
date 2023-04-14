import { Injectable } from '@angular/core';
import * as SCORM from 'pipwerks-scorm-api-wrapper';

@Injectable({
  providedIn: 'root',
})
export class ScormService {
  constructor() {}

  public init(): boolean {
    return SCORM.init();
  }

  public quit(): boolean {
    return SCORM.quit();
  }

  public set(parameter: string, value: string): boolean {
    return SCORM.set(parameter, value);
  }

  public get(parameter: string): string {
    return SCORM.get(parameter);
  }

}
