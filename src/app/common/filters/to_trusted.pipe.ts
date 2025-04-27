import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'to_trusted',
})
export class ToTrustedPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(text: string): any {
    return this.sanitizer.bypassSecurityTrustHtml(text);
  }
}
