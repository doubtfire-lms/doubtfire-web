import JSZip from 'jszip';
import * as monaco from 'monaco-editor';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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

// Matches the file open and close animations in the component styles
const FILE_ANIMATION_MS = 200;

/**
 * A file from the submission zip, shown as one card in the stack.
 */
interface SubmissionFileCard {
  entry: ArchiveFileEntry;
  requirementName: string;
  expanded: boolean;
  sizeLabel: string;
  // Highlighted html for each line of a code or text file
  codeLines: string[] | null;
  loadFailed: boolean;
  // Shown when the requirement name has no extension, or a different one
  uploadedExtension: string | null;
  extensionDiffers: boolean;
}

/**
 * Shows every file of a submission zip as a stack of collapsible cards
 * in a single scrolling column.
 */
@Component({
  selector: 'f-submission-file-stack',
  templateUrl: './submission-file-stack.component.html',
  // A size container, so an open file can be capped to the panel's visible height
  // (less the toolbar, the file header and the gaps around them)
  host: {
    'class': 'block size-full overflow-y-auto bg-white [container-type:size]',
    'style': '--file-body-height: calc(100cqh - 110px)',
  },
  styleUrls: ['./submission-file-stack.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class SubmissionFileStackComponent implements OnChanges, OnDestroy {
  @Input() archiveFile: Blob | null = null;
  @Input() uploadRequirementNames: string[] = [];
  @Input() uploadRequirementTypes: string[] = [];

  public cards: SubmissionFileCard[] = [];
  public isLoading = false;
  // Bumped to cancel a card scroll in progress
  private scrollRun = 0;
  public errorMessage: string | null = null;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['archiveFile']) {
      void this.loadArchive();
    } else if (changes['uploadRequirementNames'] || changes['uploadRequirementTypes']) {
      this.applyRequirementNames();
    }
  }

  public ngOnDestroy(): void {
    this.clearCards();
  }

  // A wheel over an open file's toolbar, or past the end of its content, would
  // otherwise scroll the whole panel. Only let it scroll something inside the file.
  @HostListener('wheel', ['$event'])
  public onWheel(event: WheelEvent): void {
    // Scrolling by hand takes over from a card scroll in progress
    this.scrollRun++;

    if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
      return;
    }

    const target = event.target as Element | null;
    // An open file's header counts as part of the file, so scrolling over it
    // doesn't slide the file under the header
    const header = target?.closest('[data-file-header]');
    const headerBody = header?.nextElementSibling;
    const body = header
      ? headerBody?.matches('[data-file-body]')
        ? headerBody
        : null
      : target?.closest('[data-file-body]');
    if (!body) {
      return;
    }

    for (let el: Element | null = header ? null : target; el; el = el.parentElement) {
      if (this.canScrollVertically(el, event.deltaY)) {
        return;
      }
      if (el === body) {
        break;
      }
    }

    // Still let the panel scroll while part of the file is hidden, so the file
    // can be brought fully back into view
    if (this.isPartlyHidden(body, event.deltaY)) {
      return;
    }
    event.preventDefault();
  }

  private isPartlyHidden(body: Element, deltaY: number): boolean {
    const bodyRect = body.getBoundingClientRect();
    if (deltaY < 0) {
      const headerBottom =
        body.previousElementSibling?.getBoundingClientRect().bottom ?? bodyRect.top;
      return bodyRect.top < headerBottom - 1;
    }
    return bodyRect.bottom > this.host.nativeElement.getBoundingClientRect().bottom + 1;
  }

  private canScrollVertically(el: Element, deltaY: number): boolean {
    const overflowY = getComputedStyle(el).overflowY;
    if (overflowY !== 'auto' && overflowY !== 'scroll') {
      return false;
    }
    return deltaY < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1;
  }

  public get allExpanded(): boolean {
    return this.cards.every((card) => card.expanded);
  }

  public get allCollapsed(): boolean {
    return this.cards.every((card) => !card.expanded);
  }

  public toggleCard(card: SubmissionFileCard): void {
    const index = this.cards.indexOf(card);
    const section = this.cardElement(index);
    const header = section?.firstElementChild;
    // A sticky header sits below the top of its card while you scroll through
    // that file. Closing it then would leave the page somewhere else.
    const headerWasStuck =
      !!section &&
      !!header &&
      header.getBoundingClientRect().top - section.getBoundingClientRect().top > 1;

    card.expanded = !card.expanded;

    // Bring the header to the top when opening, or when closing a stuck header
    if (card.expanded || headerWasStuck) {
      this.scrollToCard(index);
    }
  }

  public setAllExpanded(expanded: boolean): void {
    for (const card of this.cards) {
      card.expanded = expanded;
    }
  }

  // Closes the open file and opens the one before or after it
  public openSiblingCard(index: number, offset: number): void {
    const target = index + offset;
    if (!this.cards[target]) {
      return;
    }

    this.cards[index].expanded = false;
    this.cards[target].expanded = true;
    this.scrollToCard(target);
  }

  // Opens one file on its own, closing any others
  public jumpToCard(index: number): void {
    if (!this.cards[index]) {
      return;
    }

    this.cards.forEach((card, i) => (card.expanded = i === index));
    this.scrollToCard(index);
  }

  // Scrolls a card's header to the top in step with the open and close
  // animations. The target is re-measured every frame, because files growing
  // and shrinking around it keep moving it (and the panel's scroll limit).
  private scrollToCard(index: number): void {
    const panel = this.host.nativeElement;
    const run = ++this.scrollRun;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let from: number | null = null;
    let start = 0;

    const step = (now: number): void => {
      const section = this.cardElement(index);
      if (run !== this.scrollRun || !section) {
        return;
      }

      const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      const target =
        panel.scrollTop +
        section.getBoundingClientRect().top -
        panel.getBoundingClientRect().top -
        margin;

      if (from === null) {
        from = panel.scrollTop;
        start = now;
      }
      const progress = reduceMotion ? 1 : Math.min((now - start) / FILE_ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      panel.scrollTop = from + (target - from) * eased;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.refreshCursor();
      }
    };
    requestAnimationFrame(step);
  }

  // Browsers only re-check what's under a still mouse when a cursor style changes,
  // so after the header slides out from under it the pointer cursor would stick
  private refreshCursor(): void {
    const panel = this.host.nativeElement;
    panel.style.cursor = 'default';
    requestAnimationFrame(() => panel.style.removeProperty('cursor'));
  }

  private cardElement(index: number): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>(`#submission-file-${index}`);
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
      case 'docx':
        return 'article';
      case 'notebook':
        return 'data_object';
      default:
        return 'insert_drive_file';
    }
  }

  public downloadFile(card: SubmissionFileCard, event?: Event): void {
    event?.stopPropagation();

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
          // Cards start collapsed, so long submissions open as a short list
          expanded: false,
          sizeLabel: '',
          codeLines: null,
          loadFailed: false,
          uploadedExtension: null,
          extensionDiffers: false,
        });
      }

      // A single file is opened straight away, to save a click
      if (cards.length === 1) {
        cards[0].expanded = true;
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
      card.sizeLabel = this.formatSize(data.length);

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
      // Documents are nearly always a PDF or Word file, so their extension isn't worth showing
      const isDocument = this.uploadRequirementTypes?.[requirementIndex] === 'document';
      const required = name?.match(/\.[a-z0-9]{1,8}$/i)?.[0].toLowerCase();
      const uploaded = card.entry.name.match(/\.[^./]+$/)?.[0].toLowerCase();
      const matches = isDocument || uploaded === required;
      card.extensionDiffers = !!required && !matches;
      card.uploadedExtension = matches ? null : (uploaded ?? (required ? 'no extension' : null));
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

  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
