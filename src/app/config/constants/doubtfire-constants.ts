import { HttpClient, HttpBackend } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import API_URL from 'src/app/config/constants/apiURL';

interface SettingsResponseFormat {
  externalName: string;
  hasLogo: boolean;
  logoUrl: string;
  logoLinkUrl: string;
  overseerEnabled: boolean;
  tiiEnabled: boolean;
  d2lEnabled: boolean;
}

export interface LogoSettings {
  hasLogo: boolean;
  logoUrl: string;
  logoLinkUrl: string;
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

  /**
   * Whether or not the Overseer feature is enabled.
   */
  public IsOverseerEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Whether or not the D2L integration is enabled.
   */
  public IsD2LEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Details on the logo
   */
  public LogoSettings: BehaviorSubject<LogoSettings> = new BehaviorSubject<LogoSettings>({
    hasLogo: false,
    logoUrl: '/assets/images/institution-logo.png',
    logoLinkUrl: '/',
  });

  /**
   * Whether or not the TurnItIn integration is enabled.
   */
  public IsTiiEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly settingsUrl: string = `${this.API_URL}/settings`;

  constructor(handler: HttpBackend) {
    // Don't use interceptors for Doubtfire Constants
    this.http = new HttpClient(handler);
    this.loadSettings();
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
  private loadSettings() {
    this.http.get<SettingsResponseFormat>(this.settingsUrl).subscribe((result) => {
      this.ExternalName.next(result.externalName);
      this.IsOverseerEnabled.next(result.overseerEnabled);
      this.IsTiiEnabled.next(result.tiiEnabled);
      this.IsD2LEnabled.next(result.d2lEnabled);

      this.LogoSettings.next({
        hasLogo: result.hasLogo,
        logoUrl: result.logoUrl,
        logoLinkUrl: result.logoLinkUrl
      });
    });
  }
}
