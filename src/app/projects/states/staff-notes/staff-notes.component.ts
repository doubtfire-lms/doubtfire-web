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
  // TODO: markdown support / new lines
  @ViewChild('staffNotesContainer') staffNotesContainer!: ElementRef;

  @Input() project: Project;
  // staffNotes: StaffNote[];
  user: User;

  loadingStaffNotes: boolean = true;

  noteText: string = '';

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

    this.staffNoteService.addNote(this.project, noteText, null).subscribe((note) => {
      console.log(note);
      this.alertService.success('Succesfully submitted note', 4000);
      this.scrollDown();
      // TODO: if it errors restore the note into the textarea
    });
  }
}
