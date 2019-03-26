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

  public loaded: boolean = false;
  public apiURL: string = apiURL;

  public myBehaviorSubject = new BehaviorSubject<string>('Loading...');

  private loadExternalName() {
    this.http.get<externalNameResponseFormat>(`${this.apiURL}/settings`)
      .subscribe(result => this.myBehaviorSubject.next(result.externalName)),
      (error) => {
        console.error(error);
      };
  }

}
