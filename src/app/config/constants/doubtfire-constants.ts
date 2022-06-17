import { HttpClient, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import API_URL from 'src/app/config/constants/apiURL';

interface SettingsResponseFormat {
  externalName: string;
  overseer_enabled: boolean;
}

interface SignOutUrlResponseFormat {
  auth_signout_url: string;
}

@Injectable({ providedIn: 'root' })
export class DoubtfireConstants {
  private http: HttpClient;

  public mainContributors: ReadonlyArray<string> = [
    'macite', // Andrew Cain
    'alexcu', // Alex Cummaudo
    'jakerenzella', // Jake Renzella
  ];

  public API_URL: string = API_URL;

  // Where should we redirect users on signout?
  public SignoutURL: string;

  // initialise exernal name to loading.
  public ExternalName: BehaviorSubject<string> = new BehaviorSubject<string>('Loading...');

  public IsOverseerEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly settingsUrl: string = `${this.API_URL}/settings`;

  constructor(handler: HttpBackend) {
    // Don't use interceptors for Doubtfire Constants
    this.http = new HttpClient(handler);
    this.loadExternalName();
    this.loadSignoutUrl();
  }

  private loadSignoutUrl() {
    const url: string = `${this.API_URL}/auth/signout_url`;

    this.http.get<SignOutUrlResponseFormat>(url).subscribe(
      (result) => (this.SignoutURL = result.auth_signout_url),
      (error) => console.error(error)
    );
  }

  // publish update to ExternalName when get request finishes.
  private loadExternalName() {
    this.http
      .get<SettingsResponseFormat>(this.settingsUrl)
      .subscribe((result) => {
        this.ExternalName.next(result.externalName);
        this.IsOverseerEnabled.next(result.overseer_enabled);
      });
  }
}
