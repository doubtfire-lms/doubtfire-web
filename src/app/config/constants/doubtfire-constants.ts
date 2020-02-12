import { HttpClient, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import API_URL from 'src/app/config/constants/apiURL';

interface externalNameResponseFormat {
  externalName: string;
}

interface signoutUrlResponseFormat {
  auth_signout_url: string;
}

@Injectable({ providedIn: 'root' })
export class DoubtfireConstants {
  private http: HttpClient;
  constructor(handler: HttpBackend) {
    // Don't use interceptors for Doubtfire Constants
    this.http = new HttpClient(handler);
    this.loadExternalName();
    this.loadSignoutUrl();
  }

  public mainContributors: ReadonlyArray<string> = [
    'macite',              // Andrew Cain
    'alexcu',              // Alex Cummaudo
    'jakerenzella'         // Jake Renzella
  ];

  public API_URL: string = API_URL;

  // Where should we redirect users on signout?
  public SignoutURL: string;

  private loadSignoutUrl() {
    const url: string = `${this.API_URL}/auth/signout_url`;

    this.http.get<signoutUrlResponseFormat>(url)
      .subscribe(
        result => this.SignoutURL = result.auth_signout_url,
        error => console.error(error)
      );
  }

  // initialise exernal name to loading.
  public ExternalName: BehaviorSubject<string> = new BehaviorSubject<string>('Loading...');
  private readonly settingsUrl: string = `${this.API_URL}/settings`;

  // publish update to ExternalName when get request finishes.
  private loadExternalName() {
    this.http.get<externalNameResponseFormat>(this.settingsUrl)
      .subscribe(
        result => this.ExternalName.next(result.externalName)
      );
  }
}
