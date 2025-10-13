import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {DoubtfireConstants} from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'f-unavailable-card',
  templateUrl: './unavailable-card.component.html',
  styleUrls: ['./unavailable-card.component.scss'],
})
export class UnavailableCardComponent implements OnInit {
  constructor(
    private httpClient: HttpClient,
    private constants: DoubtfireConstants,
  ) {}

  private attemptRefresh = null;

  ngOnInit() {
    clearInterval(this.attemptRefresh);
    this.attemptRefresh = setInterval(() => {
      this.httpClient.get(`${this.constants.API_URL}/auth/method`).subscribe(() => {
        window.location.reload();
        clearInterval(this.attemptRefresh);
        this.attemptRefresh = null;
      });
    }, 5000);
  }
}
