import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface externalNameResponseFormat {
  externalName: String;
};

@Injectable({
  providedIn: 'root',
})
export class DoubtfireConstants {
  constructor(private httpClient: HttpClient) {
    console.log("getting api url");
    httpClient.get(`${this.apiURL}/settings`).toPromise().then((response: externalNameResponseFormat) => {
      this.externalName = response.externalName;
      console.log("Loaded " + response.externalName);
    })
  }
  public mainContributors: Array<string> = [
    'macite',              // Andrew Cain
    'alexcu',              // Alex Cummaudo
    'jakerenzella'
  ];
  public apiURL = "http://localhost:3000/api"
  public externalName: String = "Loading...";
}

