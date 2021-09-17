import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UIRouterGlobals } from '@uirouter/core';
import { DoubtfireConstants } from 'src/app/config/constants/doubtfire-constants';

@Component({
  selector: 'iotrack-qrcode-login',
  templateUrl: 'qrcode-login.component.html',
  styleUrls: ['qrcode-login.component.scss'],
})
export class IotrackQrCodeLogin implements OnInit {
  public room: string;
  public seat: string;
  public message: string = '';

  constructor(private routerGlobal: UIRouterGlobals, private http: HttpClient, private constants: DoubtfireConstants) {}

  ngOnInit() {
    this.room = this.routerGlobal.params.room;
    this.seat = this.routerGlobal.params.seat;

    this.http
      .put(`${this.constants.API_URL}/iotrack/assing-seat`, {
        room_number: this.room,
        seat_number: this.seat,
      })
      .subscribe(
        () => {
          this.message = `Check in successful. You are assigned to seat #${this.seat}`;
        },
        (e) => {
          this.message = `Check in failed. ${e}`;
        }
      );
  }
}
