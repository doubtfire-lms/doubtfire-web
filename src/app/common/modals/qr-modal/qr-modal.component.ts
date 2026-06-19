import QRCode from 'qrcode';
import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {QrModalData} from './qr-modal.service';

@Component({
  selector: 'f-qr-modal',
  templateUrl: './qr-modal.component.html',
  styleUrls: ['./qr-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class QrModalComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: QrModalData) {}

  qrCodeImage: string;
  caption: string;
  footer: string;

  ngOnInit() {
    this.caption = this.data.caption;
    this.footer = this.data.footer;
    if (this.data?.qrCodeImage) {
      this.generateQr();
    }
  }

  generateQr() {
    const u = new URL(this.data.qrCodeImage);
    u.searchParams.set('time', Math.floor(Date.now() / 1000).toString());
    this.qrCodeImage = u.toString();

    QRCode.toDataURL(u.toString()).then((url) => {
      this.qrCodeImage = url;
    });
  }
}
