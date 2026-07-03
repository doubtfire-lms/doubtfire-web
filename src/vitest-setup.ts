import {vi} from 'vitest';
import 'zone.js/plugins/vitest-patch';
import {Directive, EventEmitter, Input, NgModule, Output} from '@angular/core';

if (!document.queryCommandSupported) {
  document.queryCommandSupported = () => false;
}

vi.mock('ng2-pdf-viewer', () => {
  @Directive({
    selector: 'pdf-viewer',
    standalone: false,
    inputs: [
      'fitToPage: fit-to-page',
      'originalSize: original-size',
      'renderText: render-text',
      'showAll: show-all',
    ],
    outputs: [
      'afterLoadComplete: after-load-complete',
      'progress: on-progress',
      'pageRendered: page-rendered',
      'textLayerRendered: text-layer-rendered',
    ],
  })
  class MockPdfViewerComponent {
    @Input() src: unknown;
    @Input() autoresize: unknown;
    fitToPage: unknown;
    originalSize: unknown;
    renderText: unknown;
    showAll: unknown;
    @Input() zoom: unknown;
    @Input() page: unknown;

    afterLoadComplete: EventEmitter<unknown> = new EventEmitter();
    progress: EventEmitter<unknown> = new EventEmitter();
    pageRendered: EventEmitter<unknown> = new EventEmitter();
    textLayerRendered: EventEmitter<unknown> = new EventEmitter();
    @Output() pageChange: EventEmitter<unknown> = new EventEmitter();

    eventBus = {
      dispatch: vi.fn(),
    };

    pdfViewer = {
      pagesCount: 0,
      scrollPageIntoView: vi.fn(),
    };
  }

  @NgModule({
    declarations: [MockPdfViewerComponent],
    exports: [MockPdfViewerComponent],
  })
  class MockPdfViewerModule {}

  return {
    PDFDocumentProxy: class {},
    PDFProgressData: class {},
    PdfViewerComponent: MockPdfViewerComponent,
    PdfViewerModule: MockPdfViewerModule,
  };
});
