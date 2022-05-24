import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { FileDownloaderService } from '../file-downloader/file-downloader';
import { PdfViewerPanelComponent } from './pdf-viewer-panel.component';

describe('PdfViewerPanelComponent', () => {
  let component: PdfViewerPanelComponent;
  let fixture: ComponentFixture<PdfViewerPanelComponent>;
  let fileDownloaderServiceStub: Partial<FileDownloaderService>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PdfViewerPanelComponent],
        imports: [HttpClientModule],
        providers: [{ provide: FileDownloaderService, useValue: fileDownloaderServiceStub }],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfViewerPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
