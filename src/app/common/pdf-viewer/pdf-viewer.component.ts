import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent implements OnInit {

  @Input() pdfUrl: string;
  constructor() { }

  ngOnInit(): void {
  }

}
