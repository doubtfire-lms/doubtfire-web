import {beforeEach, describe, expect, it} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FileDownloaderService} from '../file-downloader/file-downloader.service';
import {PdfViewerPanelComponent} from './pdf-viewer-panel.component';

const emptyProvider = {};

describe('PdfViewerPanelComponent', () => {
  let component: PdfViewerPanelComponent;
  let fixture: ComponentFixture<PdfViewerPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfViewerPanelComponent],
      providers: [{provide: FileDownloaderService, useValue: emptyProvider}],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PdfViewerPanelComponent, {set: {template: ''}})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfViewerPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
