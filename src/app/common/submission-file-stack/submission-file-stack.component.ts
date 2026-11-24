import JSZip from 'jszip';
import * as monaco from 'monaco-editor';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import {
  ArchiveFileEntry,
  classifyArchiveFile,
  createArchiveFileEntry,
  createArchiveFilePlaceholder,
  getOrderedUploadFileIndex,
  isArchiveCodeOrTextFile,
  isArchivePathHidden,
} from '../archive-viewer/archive-viewer.helpers';

/**
 * A file from the submission zip, shown as one card in the stack.
 */
interface SubmissionFileCard {
  entry: ArchiveFileEntry;
  requirementName: string;
  expanded: boolean;
  // Highlighted html for each line of a code or text file
  codeLines: string[] | null;
  loadFailed: boolean;
}

/**
 * Shows every file of a submission zip as a stack of collapsible cards
 * in a single scrolling column.
 */
@Component({
  selector: 'f-submission-file-stack',
  templateUrl: './submission-file-stack.component.html',
  host: {'class': 'block size-full overflow-y-auto bg-slate-50'},
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionFileStackComponent implements OnChanges, OnDestroy {
  @Input() archiveFile: Blob | null = null;
  @Input() uploadRequirementNames: string[] = [];

  public cards: SubmissionFileCard[] = [];
  public isLoading = false;
  public errorMessage: string | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['archiveFile']) {
      void this.loadArchive();
    } else if (changes['uploadRequirementNames']) {
      this.applyRequirementNames();
    }
  }

  public ngOnDestroy(): void {
    this.clearCards();
  }

  public get allExpanded(): boolean {
    return this.cards.every((card) => card.expanded);
  }

  public get allCollapsed(): boolean {
    return this.cards.every((card) => !card.expanded);
  }

  public toggleCard(card: SubmissionFileCard): void {
    card.expanded = !card.expanded;
  }

  public setAllExpanded(expanded: boolean): void {
    for (const card of this.cards) {
      card.expanded = expanded;
    }
  }

  public jumpToCard(index: number): void {
    const card = this.cards[index];
    if (!card) {
      return;
    }

    card.expanded = true;
    // Wait for the card to render expanded before scrolling to it
    setTimeout(() => {
      const element = this.host.nativeElement.querySelector(`#submission-file-${index}`);
      element?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  public iconFor(card: SubmissionFileCard): string {
    switch (card.entry.kind) {
      case 'code':
        return 'code';
      case 'text':
        return 'description';
      case 'image':
        return 'image';
      case 'pdf':
        return 'picture_as_pdf';
      default:
        return 'insert_drive_file';
    }
  }

  public downloadFile(card: SubmissionFileCard, event: Event): void {
    event.stopPropagation();

    const blob = card.entry.blob;
    if (!blob) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = card.entry.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  // Opens a PDF in a new tab, in the browser's own viewer (zoom, search, print)
  public openInBrowserViewer(card: SubmissionFileCard, event: Event): void {
    event.stopPropagation();

    const pdfUrl = card.entry.blobUrl;
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  }

  private async loadArchive(): Promise<void> {
    const requestedArchive = this.archiveFile;

    this.clearCards();
    this.errorMessage = null;

    if (!requestedArchive) {
      return;
    }

    this.isLoading = true;

    try {
      const zip = await JSZip.loadAsync(await requestedArchive.arrayBuffer());
      const paths = Object.keys(zip.files).sort((a, b) => a.localeCompare(b));
      const cards: SubmissionFileCard[] = [];

      for (const path of paths) {
        const zipFile = zip.files[path];
        if (!zipFile || zipFile.dir || isArchivePathHidden(path)) {
          continue;
        }

        cards.push({
          entry: createArchiveFilePlaceholder(path, zipFile),
          requirementName: '',
          expanded: true,
          codeLines: null,
          loadFailed: false,
        });
      }

      if (requestedArchive !== this.archiveFile) {
        return;
      }

      this.cards = cards;
      this.applyRequirementNames();

      if (cards.length === 0) {
        this.errorMessage = 'This submission does not contain any files.';
      }
    } catch {
      this.errorMessage = 'Unable to read the submitted files.';
    } finally {
      if (requestedArchive === this.archiveFile) {
        this.isLoading = false;
      }
    }

    for (const card of this.cards) {
      if (requestedArchive !== this.archiveFile) {
        return;
      }
      await this.loadCard(card);
    }
  }

  private async loadCard(card: SubmissionFileCard): Promise<void> {
    const entry = card.entry;
    entry.isLoading = true;

    try {
      const data = await entry.zipObject.async('uint8array');
      const classification = classifyArchiveFile(entry.path, data);
      Object.assign(entry, createArchiveFileEntry(entry, classification, data));

      if (isArchiveCodeOrTextFile(entry)) {
        card.codeLines = await this.highlightLines(entry.textContent ?? '', entry.language);
      }
    } catch {
      entry.isLoading = false;
      card.loadFailed = true;
    }
  }

  private async highlightLines(text: string, language?: string): Promise<string[]> {
    const normalised = text.replace(/\r\n?/g, '\n');
    let html: string;

    try {
      html = await monaco.editor.colorize(normalised, language || 'plaintext', {tabSize: 4});
    } catch {
      html = this.escapeHtml(normalised).replace(/\n/g, '<br/>');
    }

    const lines = html.split(/<br\s*\/?>/);
    // Drop the empty line after a trailing newline
    if (lines.length > 1 && lines[lines.length - 1].replace(/<[^>]*>/g, '') === '') {
      lines.pop();
    }
    return lines;
  }

  private applyRequirementNames(): void {
    this.cards.forEach((card, index) => {
      const requirementIndex = getOrderedUploadFileIndex(card.entry.path) ?? index;
      const name = this.uploadRequirementNames?.[requirementIndex]?.trim();
      card.requirementName = name || card.entry.name;
    });
  }

  private clearCards(): void {
    for (const card of this.cards) {
      if (card.entry.blobUrl) {
        URL.revokeObjectURL(card.entry.blobUrl);
      }
    }
    this.cards = [];
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
