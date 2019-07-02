import { Component, Inject, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { timer, Subscription } from 'rxjs';
import { IntelligentDiscussionPlayerService } from './intelligent-discussion-player.service';
import * as moment from 'moment';
import { MicrophoneTesterComponent } from 'src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './intelligent-discussion-recorder/intelligent-discussion-recorder.component';

interface DiscussionComment {
  created_at: string;
  id: number;
  task_comment_id: number;
  time_completed: string;
  time_started: string;
  response: string;
  status: string;
}

@Component({
  selector: 'intelligent-discussion-player',
  templateUrl: './intelligent-discussion-player.component.html',
  styleUrls: ['./intelligent-discussion-player.component.scss']
})
export class IntelligentDiscussionPlayerComponent implements OnInit {
  @Input() discussion: DiscussionComment;
  @Input() task: any;
  loading: boolean = false;

  constructor(
    public dialog: MatDialog, ) {
  }

  ngOnInit() {
    console.log(this.discussion);
  }

  get responseAvailable() {
    return this.discussion.status === 'complete'; // TODO: This needs to change to a field addded to DCs
  }

  beginDiscussion(): void {
    // this.loading = true;
    // load audio prompts soon.
    let dialogRef: MatDialogRef<IntelligentDiscussionDialog, any>;

    dialogRef = this.dialog.open(IntelligentDiscussionDialog, {
      data: {
        dc: this.discussion,
        task: this.task
      },
      maxWidth: '800px',
      disableClose: true
    });

    dialogRef.afterOpened().subscribe((result: any) => {
    });

    dialogRef.afterClosed().subscribe((result: any) => {
    });
  }
}

interface Prompt {
  url: string;
  id: number;
  responseRecorded: boolean;
}
// The Dialog Component
@Component({
  selector: 'intelligent-discussion-dialog',
  templateUrl: 'intelligent-discussion-dialog.html',
  styleUrls: ['./intelligent-discussion-player.component.scss'],
  providers: [IntelligentDiscussionPlayerService]
})
export class IntelligentDiscussionDialog implements OnInit {
  confirmed = false;
  timerText: string = '4m:00s';
  ticks: number = 0;
  startedDiscussion = false;
  inDiscussion = false;
  discussionComplete: boolean = false;
  count: number = 3 * 60 * 1000; // 3 minutes
  activePromptId: number = 0;
  counter: Subscription;
  audio: HTMLAudioElement;

  @ViewChild('testRecorder') testRecorder: MicrophoneTesterComponent;
  @ViewChild('discussionRecorder') discussionRecorder: IntelligentDiscussionRecorderComponent;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    private discussionService: IntelligentDiscussionPlayerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.audio = new Audio();
  }

  disableTester() {
    this.testRecorder.stopRecording();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get numberOfPrompts(): number {
    return this.data.dc.number_of_prompts;
  }

  finishDiscussion() {
    this.discussionComplete = true;
    this.inDiscussion = false;
    this.discussionRecorder.stopRecording();
    this.audio.pause();
    this.audio = null;
    this.counter.unsubscribe();
  }

  startDiscussion() {
    if (!this.startedDiscussion) {

      this.setPrompt();

      // start recording
      this.discussionRecorder.startRecording();

      // start the discussion
      this.startedDiscussion = true;
      this.inDiscussion = true;

      // get the cutoff date from the server
      // For now this is stubbed as 4 minutes from now.
      let discussionCutoff = moment().add(4, 'minutes');

      this.counter = timer(0, 1000).subscribe(val => {
        let difference = discussionCutoff.diff(moment());
        if (difference <= 0) {
          difference = 0;
        }
        this.timerText = moment.utc(difference).format('mm[m]:ss[s]');
        this.ticks = val;

        if (difference === 0) {
          this.inDiscussion = false;
          this.counter.unsubscribe();
        }
      });
    }
  }

  setPrompt() {
    this.audio.src = this.discussionService.getDiscussionPromptUrl(this.data.task, this.data.dc.id, this.activePromptId);
    this.audio.load();
    this.audio.play();
  }

  responseConfirmed(e: any) {
    if (this.activePromptId !== this.numberOfPrompts - 1) {
      this.activePromptId++;
      this.setPrompt();
    } else {
      this.finishDiscussion();
    }
  }
}
