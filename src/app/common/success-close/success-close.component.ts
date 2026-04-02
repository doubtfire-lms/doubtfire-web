import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'f-success-close',
  templateUrl: 'success-close.component.html',
  styleUrls: ['success-close.component.scss']
})
export class SuccessCloseComponent implements OnInit {
  ngOnInit(): void {
    setTimeout(() => {
      window.close();
    }, 3000);
  }
}
