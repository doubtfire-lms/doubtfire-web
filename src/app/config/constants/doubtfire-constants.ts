import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import API_URL from 'src/app/config/constants/apiURL';

interface SettingsFormat {
  externalName: string;
  overseer_enabled: boolean;
};

interface signoutUrlResponseFormat {
  auth_signout_url: string;
};

@Injectable({ providedIn: 'root' })
export class DoubtfireConstants {
  constructor(private http: HttpClient) {
    this.loadSettings();
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

  // initialise exernal name to loading.
  public ExternalName: BehaviorSubject<string> = new BehaviorSubject<string>('Loading...');

  public IsOverseerEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  private readonly settingsUrl: string = `${this.API_URL}/settings`;

  private loadSignoutUrl() {
    const url: string = `${this.API_URL}/auth/signout_url`;

    this.http.get<signoutUrlResponseFormat>(url)
      .subscribe(
        result => this.SignoutURL = result.auth_signout_url,
        error => console.error(error)
      )
  }

  // publish update to Settings when get request finishes.
  private loadSettings() {
    this.http.get<SettingsFormat>(this.settingsUrl)
      .subscribe(
        result => {
          this.ExternalName.next(result.externalName);
          this.IsOverseerEnabled.next(result.overseer_enabled);
        }
      );
  }
}
