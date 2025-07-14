import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import QRCode from 'qrcode';

@Component({
  selector: 'f-qr-modal',
  templateUrl: './qr-modal.component.html',
  styleUrls: ['./qr-modal.component.scss'],
})
export class QrModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string) {}

  qrCodeImage: string;

  ngOnInit() {
    if (this.data) {
      QRCode.toDataURL(this.data).then((url) => {
        this.qrCodeImage = url;
      });
    }
  }
}
