import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import API_URL from 'src/app/config/constants/apiUrl';

interface Response {
  privacy: string;
  plagiarism: string;
}

@Injectable({
  providedIn: 'root',
})
export class PrivacyPolicy {
  privacy = '';
  plagiarism = '';
  loaded = false;

  public API_URL: string = API_URL;

  constructor(private http: HttpClient) {
    const url: string = `${this.API_URL}/settings/privacy`;

    this.http.get<Response>(url).subscribe((response) => {
      this.privacy = response.privacy;
      this.plagiarism = response.plagiarism;
      this.loaded = true;
    });
  }
}
