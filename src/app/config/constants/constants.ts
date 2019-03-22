import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import apiURL from 'src/app/config/constants/apiURL';
interface externalNameResponseFormat {
  externalName: String;
};

@Injectable({
  providedIn: 'root',
})
export class DoubtfireConstants {
  constructor(private httpClient: HttpClient) {
    httpClient.get(`${this.apiURL}/settings`).toPromise().then((response: externalNameResponseFormat) => {
      this.externalName = response.externalName;
    })
  }
  public mainContributors: string[] = [
    'macite',              // Andrew Cain
    'alexcu',              // Alex Cummaudo
    'jakerenzella'         // Jake Renzella
  ];
  public apiURL = apiURL;
  public externalName: String = "Loading...";
}

