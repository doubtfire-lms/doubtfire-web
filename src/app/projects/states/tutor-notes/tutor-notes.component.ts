import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {Task, UnitRole, UserService} from 'src/app/api/models/doubtfire-model';
import {TutorNote} from 'src/app/api/models/tutor-note';
import {NotificationService} from 'src/app/api/services/notification.service';
import {TutorNoteService} from 'src/app/api/services/tutor-note.service';
import {ConfirmationModalService} from 'src/app/common/modals/confirmation-modal/confirmation-modal.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-tutor-notes',
  templateUrl: './tutor-notes.component.html',
  styleUrl: './tutor-notes.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class TutorNotesComponent implements OnInit, OnChanges {
  @ViewChild('tutorNotesContainer') tutorNotesContainer!: ElementRef;
  @ViewChild('tutorNoteEditor', {static: false}) tutorNoteEditor!: ElementRef<HTMLTextAreaElement>;

  @Input() unitRole: UnitRole;
  @Input() task: Task;
  @Input() focusNoteId?: number;

  loadingTutorNotes: boolean = true;

  noteText: string = '';

  editingNote?: TutorNote;
  editingNoteText?: string = '';

  replyingToNote?: TutorNote;

  hoveredNoteId: number | null = null;

  constructor(
    private userService: UserService,
    private tutorNoteService: TutorNoteService,
    private notificationService: NotificationService,
    private alertService: AlertService,
    private confirmationModalService: ConfirmationModalService,
  ) {}
  ngOnInit(): void {
    this.loadNotes();
  }

  // The dashboard keeps this component alive when you move between tasks.
  ngOnChanges(changes: SimpleChanges): void {
    const source = this.task ? changes.task : changes.unitRole;
    if (source && !source.firstChange) {
      this.loadNotes();
    } else if (changes.focusNoteId && !changes.focusNoteId.firstChange) {
      this.focusRequestedNote();
    }
  }

  private loadNotes(): void {
    if (this.task && !this.unitRole) {
      this.unitRole = this.task.tutor;
    }

    this.resetTaskFilter();
    this.editingNote = null;
    this.replyingToNote = null;

    this.loadingTutorNotes = true;
    this.tutorNoteService.loadTutorNotes(this.unitRole).subscribe((_notes) => {
      this.loadingTutorNotes = false;
      this.tutorNoteService.updateTutorNoteReplies(this.unitRole?.tutorNotesCache.currentValues);
      this.scrollDown();
      this.focusRequestedNote();
    });
  }

  private resetTaskFilter(): void {
    this.selectedTaskDefinitions.clear();
    this.selectedTaskDefinitions.set(this.task ? this.task.definition.abbreviation : 'all', true);
  }

  private focusRequestedNote(): void {
    if (!this.focusNoteId) {
      return;
    }

    setTimeout(() => {
      const note = this.unitRole.tutorNotesCache.get(this.focusNoteId);
      if (note) {
        this.scrollToNote(note);
      }
    }, 100);
  }

  scrollToComment(commentID: number) {
    document.querySelector(`#comment-${commentID}`).scrollIntoView();
  }

  scrollDown() {
    setTimeout(() => {
      const el = this.tutorNotesContainer.nativeElement;
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
        next: (_note) => {
          this.alertService.success('Succesfully submitted note', 4000);
          this.scrollDown();
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

  public markAsRead(note: TutorNote) {
    this.tutorNoteService.markAsRead(this.unitRole, note).subscribe({
      next: (response) => {
        if (response) {
          this.notificationService.refreshUnreadCount();
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
      this.autoResizeTutorNoteEditor();
      this.tutorNoteEditor?.nativeElement.focus();
    });
  }

  public cancelEditingNote() {
    this.editingNote = null;
    this.editingNoteText = '';
  }

  public autoResizeTutorNoteEditor() {
    const el = this.tutorNoteEditor.nativeElement;
    el.style.height = 'auto';
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
        if (allSelected) {
          return true;
        }
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
    link.href = `/projects/${note.project.id}/dashboard/${note.taskDefinition.abbreviation}`;
    link.target = '_blank';
    link.click();
  }
}
