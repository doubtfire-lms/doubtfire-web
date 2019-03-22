import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

import apiURL from 'src/app/config/constants/apiURL';
interface ExternalNameResponseFormat {
  externalName: string;
};

@Injectable({
  providedIn: 'root',
})
export class DoubtfireConstants {
  constructor(
    private http: HttpClient,
    private title: Title
  ) {
    http
      .get<ExternalNameResponseFormat>(`${this.apiURL}/settings`)
      .subscribe(
        (response) => {
          this.externalName = response.externalName;
          title.setTitle(this.externalName);
        },
        (error) => {
          this.externalName = "Doubtfire";
          title.setTitle(this.externalName);
        }
      )
  }
  public mainContributors: string[] = [
    'macite',              // Andrew Cain
    'alexcu',              // Alex Cummaudo
    'jakerenzella'         // Jake Renzella
  ];
  public apiURL = apiURL;
  public externalName: string = "Loading...";
}

