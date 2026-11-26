import {Directive, EventEmitter, HostBinding, HostListener, Output} from '@angular/core';

/**
 * The "appDragDrop" directive can be added to angular components to allow them to act as
 * a file drag and drop source. This will emit a `onFileDrop` event when files are dropped
 * onto the component. While a file is being dragged over the component, the dragover css
 * class will be applied to the element.
 */
@Directive({
  selector: '[appDragDrop]',
  standalone: false,
})
export class DragDropDirective {
  @Output() fileDropped: EventEmitter<FileList> = new EventEmitter();

  // @HostBinding('style.background-color') private background = '#f5fcff';
  // @HostBinding('style.opacity') private opacity = '1';
  @HostBinding('class.dragover') private dragOver = false;

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    // this.background = '#9ecbec';
    // this.opacity = '0.8';
    this.dragOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    // this.background = '#f5fcff';
    // this.opacity = '1';
    this.dragOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.dragOver = false;
    // this.background = '#f5fcff';
    // this.opacity = '1';
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files);
    }
  }
}
