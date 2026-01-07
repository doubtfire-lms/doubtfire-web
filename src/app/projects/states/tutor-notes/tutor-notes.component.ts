import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Task, UserService} from 'src/app/api/models/doubtfire-model';
import {TutorNote} from 'src/app/api/models/tutor-note';
import {TutorNoteService} from 'src/app/api/services/tutor-note.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-tutor-notes',
  templateUrl: './tutor-notes.component.html',
  styleUrl: './tutor-notes.component.scss',
})
export class TutorNotesComponent implements OnInit {
  @ViewChild('staffNotesContainer') staffNotesContainer!: ElementRef;
  @ViewChild('staffNoteEditor', {static: false}) staffNoteEditor!: ElementRef<HTMLTextAreaElement>;

  // @Input() unitRole: UnitRole;
  @Input() task: Task;
  // @Input() project: Project;

  // TODO: allow unitRole Input(), but if its nil, we need to set it during OnInit
  // TODO: otherwise, if task is null and unitRole exists (When current users access their own tutor notes, here we can load tutor notes with a unitRole and no task)

  public get unitRole() {
    const enrolments = this.task.project.tutorialEnrolmentsCache.currentValues.filter(
      (t) => t.tutorialStream.name === this.task.definition.tutorialStream.name,
    );
    // TODO: is checking for just the one tutorial enrolment correct? should be..
    if (enrolments.length === 1) {
      const user = enrolments[0].tutor;
      return this.task.unit.staff.find((ur) => ur.user.id === user.id);
    }
  }

  loadingStaffNotes: boolean = true;

  noteText: string = '';

  editingNote?: TutorNote;
  editingNoteText?: string = '';

  replyingToNote?: TutorNote;

  hoveredNoteId: number | null = null;

  constructor(
    private userService: UserService,
    private tutorNoteService: TutorNoteService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
  ) {}
  ngOnInit(): void {
    this.loadingStaffNotes = true;
    this.tutorNoteService.loadTutorNotes(this.unitRole).subscribe((notes) => {
      this.loadingStaffNotes = false;
      this.tutorNoteService.updateTutorNoteReplies(this.unitRole?.tutorNotesCache.currentValues);
      this.scrollDown();
    });
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

    this.tutorNoteService.addNote(this.unitRole, noteText, this.replyingToNote).subscribe({
      next: (note) => {
        this.alertService.success('Succesfully submitted note', 4000);
        this.scrollDown();
        // TODO: maybe we do export a tutorNoteCount? but then we dont know for which tasks they are for
        // TODO: itll only be helpful in the header notifications icon...
        // TODO: otherwise, we could just load all the notes for a mentors mentee when loading the audt page?

        // this.project.staffNoteCount++;
        this.replyingToNote = null;
        this.tutorNoteService.updateTutorNoteReplies(this.unitRole?.tutorNotesCache.currentValues);
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

    this.tutorNoteService.updateNote(this.unitRole, this.editingNote, noteText).subscribe({
      next: (note) => {
        this.alertService.success('Succesfully updated note', 4000);
        this.editingNote = null;
        this.editingNoteText = '';
      },
      error: (error) => {
        this.alertService.error(`Failed to update note: ${error}`, 4000);
      },
    });
  }

  public deleteNote(note: TutorNote) {
    this.confirmationModalService.show(
      'Delete note',
      'Are you sure want to delete this tutor note?',
      () => {
        note.delete();
      },
    );
  }

  public replyToNote(note: TutorNote) {
    this.replyingToNote = note;
  }
  public cancelReplyingToNote() {
    this.replyingToNote = null;
  }

  public editNote(note: TutorNote) {
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
    el.offsetHeight;
    el.style.height = el.scrollHeight + 'px';
  }

  scrollToNote(note: TutorNote): void {
    const el = document.getElementById(`note-${note.id}`);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'center'});
      el.classList.add('flash-highlight');
      setTimeout(() => el.classList.remove('flash-highlight'), 1000);
    }
  }
}
