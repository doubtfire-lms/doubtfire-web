import { Injectable } from "@angular/core";
import { ScormAPIImplementation } from "./scorm-api-implementation";

@Injectable({
  providedIn: "root",
})
export class ScormService {
  private initialized = false;

  // Injecting ScormAPIImplementation service
  constructor(private scormAPI: ScormAPIImplementation) {}

  // Initializes the SCORM API connection and returns whether it was successful
  public init(): boolean {
    console.log('ScormService init called', this.scormAPI);
    if (this.scormAPI) {
      // Calls LMSInitialize() method of the ScormAPIImplementation service
      const result = this.scormAPI.LMSInitialize("");
      // Sets initialized flag to true if LMSInitialize() returned 'true'
      this.initialized = result === "true";
      return this.initialized;
    } else {
      console.error("SCORM API not found");
      return false;
    }
  }

  // Terminates the SCORM API connection and returns whether it was successful
  public quit(): boolean {
    if (this.scormAPI && this.initialized) {
      // Calls LMSFinish() method of the ScormAPIImplementation service
      const result = this.scormAPI.LMSFinish("");
      // Sets initialized flag to false and returns true if LMSFinish() returned 'true'
      this.initialized = false;
      return result === "true";
    } else {
      return false;
    }
  }

  // Sets a SCORM parameter and returns whether it was successful
  public set(parameter: string, value: string): boolean {
    if (this.scormAPI && this.initialized) {
      // Calls LMSSetValue() method of the ScormAPIImplementation service
      const result = this.scormAPI.LMSSetValue(parameter, value);
      return result === "true";
    } else {
      return false;
    }
  }

  // Gets a SCORM parameter value
  public get(parameter: string): string {
    if (this.scormAPI && this.initialized) {
      // Calls LMSGetValue() method of the ScormAPIImplementation service
      return this.scormAPI.LMSGetValue(parameter);
    } else {
      return "";
    }
  }
}
