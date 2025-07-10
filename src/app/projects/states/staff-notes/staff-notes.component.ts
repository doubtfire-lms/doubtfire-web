import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Project, User, UserService} from 'src/app/api/models/doubtfire-model';
import {StaffNote} from 'src/app/api/models/staff-note';
import {StaffNoteService} from 'src/app/api/services/staff-note.service';
import {AlertService} from 'src/app/common/services/alert.service';

@Component({
  selector: 'f-staff-notes',
  templateUrl: './staff-notes.component.html',
  styleUrl: './staff-notes.component.scss',
})
export class StaffNotesComponent implements OnInit {
  @ViewChild('staffNotesContainer') staffNotesContainer!: ElementRef;
  @ViewChild('staffNoteEditor', {static: false}) staffNoteEditor!: ElementRef<HTMLTextAreaElement>;

  @Input() project: Project;

  loadingStaffNotes: boolean = true;

  noteText: string = '';

  editingNote?: StaffNote;
  editingNoteText?: string = '';

  constructor(
    private userService: UserService,
    private staffNoteService: StaffNoteService,
    private alertService: AlertService,
  ) {}
  ngOnInit(): void {
    this.loadingStaffNotes = true;
    this.staffNoteService.loadStaffNotes(this.project).subscribe((notes) => {
      console.log(notes);
      this.loadingStaffNotes = false;
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

    this.staffNoteService.addNote(this.project, noteText, null).subscribe({
      next: (note) => {
        console.log(note);
        this.alertService.success('Succesfully submitted note', 4000);
        this.scrollDown();
        this.project.staffNotes++;
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

  public deleteNote(note: StaffNote) {
    note.delete();
  }

  public replyToNote(note: StaffNote) {
    console.log('replying to note...');
  }

  public editNote(note: StaffNote) {
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

  private autoResizeStaffNoteEditor() {
    const el = this.staffNoteEditor.nativeElement;
    console.log(el);
    el.style.height = 'auto';
    el.offsetHeight;
    el.style.height = el.scrollHeight + 'px';
  }
}
