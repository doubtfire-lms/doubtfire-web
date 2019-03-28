import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import apiURL from 'src/app/config/constants/apiURL';

interface externalNameResponseFormat {
  externalName: string;
};

@Injectable({ providedIn: 'root' })
export class DoubtfireConstants {
  constructor(private http: HttpClient) {
    this.loadExternalName();
  }

  public mainContributors: string[] = [
    'macite',              // Andrew Cain
    'alexcu',              // Alex Cummaudo
    'jakerenzella'         // Jake Renzella
  ];

  public apiURL: string = apiURL;

  // initialise exernal name to loading.
  public ExternalName: BehaviorSubject<string> = new BehaviorSubject<string>('Loading...');

  // publish update to ExternalName when get request finishes.
  private loadExternalName() {
    const settingsUrl: string = `${this.apiURL}/settings`;

    this.http.get<externalNameResponseFormat>(settingsUrl)
      .subscribe(
        result => this.ExternalName.next(result.externalName)
      ),
      error => console.error(error);
  }
}
