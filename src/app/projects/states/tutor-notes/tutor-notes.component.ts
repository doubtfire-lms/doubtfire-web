import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Task, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
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

  @Input() unitRole: UnitRole;
  @Input() task: Task;

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
    if (this.task && !this.unitRole) {
      this.unitRole = this.task.tutor;
    }

    this.loadingStaffNotes = true;
    this.tutorNoteService.loadTutorNotes(this.unitRole).subscribe((notes) => {
      this.loadingStaffNotes = false;
      this.tutorNoteService.updateTutorNoteReplies(this.unitRole?.tutorNotesCache.currentValues);
      this.scrollDown();
    });
    if (this.task) {
      this.selectedTaskDefinitions.set(this.task.definition.abbreviation, true);
    }
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

    this.tutorNoteService
      .addNote(this.unitRole, noteText, this.task, this.replyingToNote)
      .subscribe({
        next: (note) => {
          this.alertService.success('Succesfully submitted note', 4000);
          this.scrollDown();
          // TODO: maybe we do export a tutorNoteCount? but then we dont know for which tasks they are for
          // TODO: itll only be helpful in the header notifications icon...
          // TODO: otherwise, we could just load all the notes for a mentors mentee when loading the audt page?

          // this.project.staffNoteCount++;
          this.replyingToNote = null;
          this.tutorNoteService.updateTutorNoteReplies(
            this.unitRole?.tutorNotesCache.currentValues,
          );
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

  public markAsRead(note: TutorNote) {
    this.tutorNoteService.markAsRead(this.unitRole, note).subscribe({
      next: (response) => {
        if (response) {
          this.alertService.success(`Marked note as read`, 3000);
        } else {
          this.alertService.error(`Failed to mark as read`, 6000);
        }
      },
      error: (error) => {
        this.alertService.error(`Failed to mark as read: ${error}`, 6000);
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

  public selectedTaskDefinitions: Map<string, boolean> = new Map<string, boolean>();

  public get filteredNotes() {
    const selected = this.selectedTaskDefinitions;
    const allSelected = selected.size === 0 || selected.get('all');

    return (
      this.unitRole?.tutorNotesCache?.currentValues?.filter((note) => {
        const abbr = note.taskDefinition?.abbreviation;
        // if (!abbr) return false; // skip notes without taskDefinition
        if (allSelected) return true;
        return selected.get(abbr);
      }) ?? []
    );
  }

  toggleSelection(option: string) {
    if (this.selectedTaskDefinitions.get(option)) {
      this.selectedTaskDefinitions.set(option, false);
    } else {
      this.selectedTaskDefinitions.set(option, true);
    }
  }

  public get taskDefinitionFilters() {
    const abbrs =
      this.unitRole.tutorNotesCache.currentValues
        .map((note) => note.taskDefinition?.abbreviation)
        .filter(Boolean) ?? [];

    // Remove duplicates
    return Array.from(new Set(abbrs));
  }

  openProject(event: Event, note: TutorNote) {
    event.stopPropagation();
    const link = document.createElement('a');
    link.href = `/projects/${note.project.id}/dashboard/${note.taskDefinition.abbreviation}?tutor=true`;
    link.target = '_blank';
    link.click();
  }
}
