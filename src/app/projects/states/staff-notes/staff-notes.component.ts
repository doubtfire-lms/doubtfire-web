import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Project, UserService} from 'src/app/api/models/doubtfire-model';
import {StaffNote} from 'src/app/api/models/staff-note';
import {StaffNoteService} from 'src/app/api/services/staff-note.service';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {CommentsModalService} from 'src/app/common/modals/comments-modal/comments-modal.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {AttachmentConfirmationDialogComponent} from 'src/app/tasks/task-comment-composer/attachment-confirmation-dialog/attachment-confirmation-dialog.component';

@Component({
  selector: 'f-staff-notes',
  templateUrl: './staff-notes.component.html',
  styleUrl: './staff-notes.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StaffNotesComponent implements OnInit, OnDestroy {
  @ViewChild('staffNotesContainer') staffNotesContainer!: ElementRef;
  @ViewChild('staffNoteEditor', {static: false}) staffNoteEditor!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('attachmentUploader') attachmentUploader!: ElementRef<HTMLInputElement>;

  @Input() project: Project;

  loadingStaffNotes: boolean = true;

  noteText: string = '';

  editingNote?: StaffNote;
  editingNoteText?: string = '';

  replyingToNote?: StaffNote;

  hoveredNoteId: number | null = null;
  attachmentPreviewUrls: Record<number, string> = {};
  private readonly loadingAttachmentIds: Set<number> = new Set();
  private readonly pendingOpenAttachmentIds: Set<number> = new Set();
  private destroyed = false;

  constructor(
    private userService: UserService,
    private staffNoteService: StaffNoteService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
    private dialog: MatDialog,
    private commentsModalService: CommentsModalService,
    private fileDownloaderService: FileDownloaderService,
  ) {}
  ngOnInit(): void {
    this.loadingStaffNotes = true;
    this.staffNoteService.loadStaffNotes(this.project).subscribe((_notes) => {
      this.loadingStaffNotes = false;
      this.staffNoteService.updateStaffNoteReplies(this.project?.staffNoteCache.currentValues);
      this.project.staffNoteCache.currentValues.forEach((note) => this.loadImagePreview(note));
      this.scrollDown();
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    Object.values(this.attachmentPreviewUrls).forEach((url) =>
      this.fileDownloaderService.releaseBlob(url),
    );
  }

  public openFilePicker(): void {
    this.attachmentUploader.nativeElement.click();
  }

  public handlePaste(event: ClipboardEvent): void {
    const files = this.clipboardFiles(event.clipboardData);
    if (files.length > 0) {
      event.preventDefault();
      this.uploadFiles(files);
    }
  }

  public handleBeforeInput(event: InputEvent): void {
    if (event.inputType !== 'insertFromPaste') {
      return;
    }

    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length > 0) {
      event.preventDefault();
      this.uploadFiles(files);
    }
  }

  public uploadFiles(files: ArrayLike<File>): void {
    const acceptedFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size === 0 || file.size >= 30_000_000) {
        this.alertService.error('Attachments must be non-empty and smaller than 30 MB.', 4000);
      } else if (
        file.type.startsWith('image/') ||
        file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf')
      ) {
        acceptedFiles.push(file);
      } else {
        this.alertService.error('Only images and PDFs can be attached to staff notes.', 4000);
      }
    }

    this.confirmAttachmentsSequentially(acceptedFiles);
    this.attachmentUploader.nativeElement.value = '';
  }

  private clipboardFiles(data: DataTransfer | null): File[] {
    if (!data) {
      return [];
    }

    const directFiles = Array.from(data.files ?? []);
    if (directFiles.length > 0) {
      return directFiles;
    }

    return Array.from(data.items ?? [])
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);
  }

  private confirmAttachmentsSequentially(files: File[], index: number = 0): void {
    if (index >= files.length) {
      return;
    }

    const dialogRef = this.dialog.open(AttachmentConfirmationDialogComponent, {
      data: {file: files[index], destination: 'staff note'},
      maxWidth: '720px',
      width: 'min(92vw, 720px)',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.postAttachment(files[index]);
      }
      this.confirmAttachmentsSequentially(files, index + 1);
    });
  }

  private postAttachment(file: File): void {
    this.staffNoteService.addNote(this.project, '', this.replyingToNote, file).subscribe({
      next: (note) => {
        this.project.staffNoteCount++;
        this.staffNoteService.updateStaffNoteReplies(this.project.staffNoteCache.currentValues);
        this.loadImagePreview(note);
        this.scrollDown();
      },
      error: (error: Error) => {
        this.alertService.error(`Failed to attach file: ${error.message || error}`, 4000);
      },
    });
  }

  private loadImagePreview(note: StaffNote): void {
    if (note.attachmentType !== 'image' || this.attachmentPreviewUrls[note.id]) {
      return;
    }

    this.loadAttachment(note);
  }

  private loadAttachment(note: StaffNote, open: boolean = false): void {
    if (this.attachmentPreviewUrls[note.id]) {
      if (open) {
        this.commentsModalService.show(this.attachmentPreviewUrls[note.id], {
          commentType: note.attachmentType,
        });
      }
      return;
    }

    if (open) {
      this.pendingOpenAttachmentIds.add(note.id);
    }

    if (this.loadingAttachmentIds.has(note.id)) {
      return;
    }

    this.loadingAttachmentIds.add(note.id);
    this.fileDownloaderService.downloadBlob(
      note.attachmentUrl,
      (url) => {
        this.loadingAttachmentIds.delete(note.id);
        if (this.destroyed) {
          this.fileDownloaderService.releaseBlob(url);
          return;
        }
        this.attachmentPreviewUrls[note.id] = url;
        if (this.pendingOpenAttachmentIds.delete(note.id)) {
          this.commentsModalService.show(url, {commentType: note.attachmentType});
        }
      },
      (error) => {
        this.loadingAttachmentIds.delete(note.id);
        this.pendingOpenAttachmentIds.delete(note.id);
        this.alertService.error(`Unable to load staff note attachment: ${error}`, 4000);
      },
    );
  }

  public openAttachment(note: StaffNote): void {
    this.loadAttachment(note, true);
  }

  scrollToComment(commentID: number) {
    document.querySelector(`#comment-${commentID}`).scrollIntoView();
  }

  scrollDown() {
    setTimeout(() => {
      const el = this.staffNotesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }, 50);
  }

  public submitNote() {
    const noteText = this.noteText.trim();
    if (noteText === '') {
      return;
    }

    this.noteText = '';

    this.staffNoteService.addNote(this.project, noteText, this.replyingToNote).subscribe({
      next: (_note) => {
        this.alertService.success('Succesfully submitted note', 4000);
        this.scrollDown();
        this.project.staffNoteCount++;
        this.replyingToNote = null;
        this.staffNoteService.updateStaffNoteReplies(this.project?.staffNoteCache.currentValues);
      },
      error: (error) => {
        this.alertService.error(`Failed to create note: ${error}`, 4000);
        this.noteText = noteText;
      },
    });
  }

  public updateNote() {
    const noteText = this.editingNoteText.trim();
    if (noteText === '' || !this.editingNote) {
      return;
    }

    this.staffNoteService.updateNote(this.project, this.editingNote, noteText).subscribe({
      next: (_note) => {
        this.alertService.success('Succesfully updated note', 4000);
        this.editingNote = null;
        this.editingNoteText = '';
      },
      error: (error) => {
        this.alertService.error(`Failed to update note: ${error}`, 4000);
      },
    });
  }

  public deleteNote(note: StaffNote) {
    this.confirmationModalService.show(
      'Delete note',
      'Are you sure want to delete this staff note?',
      () => {
        note.delete();
      },
    );
  }

  public replyToNote(note: StaffNote) {
    this.replyingToNote = note;
  }
  public cancelReplyingToNote() {
    this.replyingToNote = null;
  }

  public editNote(note: StaffNote) {
    if (!note.authorIsMe) {
      return;
    }

    this.editingNote = note;
    this.editingNoteText = note.note;
    setTimeout(() => {
      this.autoResizeStaffNoteEditor();
      this.staffNoteEditor?.nativeElement.focus();
    });
  }

  public cancelEditingNote() {
    this.editingNote = null;
    this.editingNoteText = '';
  }

  public autoResizeStaffNoteEditor() {
    const el = this.staffNoteEditor.nativeElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  scrollToNote(note: StaffNote): void {
    const el = document.getElementById(`note-${note.id}`);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'center'});
      el.classList.add('flash-highlight');
      setTimeout(() => el.classList.remove('flash-highlight'), 1000);
    }
  }
}
