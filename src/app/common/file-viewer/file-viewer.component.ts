import { Component, Input } from '@angular/core';

@Component({
  selector: 'f-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
})
export class FileViewerComponent {
  @Input() src: string;
  @Input() fileType: string;
}
