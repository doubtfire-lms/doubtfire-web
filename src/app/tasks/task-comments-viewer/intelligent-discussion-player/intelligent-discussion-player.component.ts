import { Component, Inject, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
  styleUrls: ['./intelligent-discussion-player.component.scss'],
  providers: [IntelligentDiscussionPlayerService]
})
export class IntelligentDiscussionPlayerComponent implements OnInit {
  @Input() discussion: DiscussionComment;
  @Input() task: any;
  loading: boolean = false;
  audio: HTMLAudioElement;
  audioProgress: number = 0;

  constructor(
    public dialog: MatDialog,
    private discussionService: IntelligentDiscussionPlayerService,
  ) {
  }

  ngOnInit() {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => {
      const percentagePlayed = this.audio.currentTime / this.audio.duration;
      this.audioProgress = (isNaN(percentagePlayed) ? 0 : percentagePlayed) * 100;
    };
  }

  get responseAvailable() {
    return this.discussion.status === 'complete';
  }

  get isNotStudent() {
    return this.task.project().unit().my_role !== 'Student';
  }

  playResponseAudio() {
    if (this.audio.paused) {
      this.audio.src = this.discussionService.getDiscussionResponseUrl(this.task, this.discussion.id);
      this.audio.load();
      this.audio.play();
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

  }

  beginDiscussion(): void {
    let dialogRef: MatDialogRef<IntelligentDiscussionDialog, any>;

    dialogRef = this.dialog.open(IntelligentDiscussionDialog, {
      data: {
        dc: this.discussion,
        task: this.task,
        audioRef: this.audio
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

// The Dialog Component
@Component({
  selector: 'intelligent-discussion-dialog',
  templateUrl: 'intelligent-discussion-dialog.html',
  styleUrls: ['./intelligent-discussion-player.component.scss'],
  providers: [IntelligentDiscussionPlayerService]
})
export class IntelligentDiscussionDialog implements OnInit {
  confirmed = false;
  timerText: string = '15m:00s';
  ticks: number = 0;
  startedDiscussion = false;
  inDiscussion = false;
  discussionComplete: boolean = false;
  count: number = 3 * 60 * 1000; // 3 minutes
  activePromptId: number = 0;
  counter: Subscription;

  @ViewChild('testRecorder', { static: true }) testRecorder: MicrophoneTesterComponent;
  @ViewChild('discussionRecorder', { static: true }) discussionRecorder: IntelligentDiscussionRecorderComponent;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    private discussionService: IntelligentDiscussionPlayerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
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
    this.data.audioRef.pause();
    this.data.audioRef.currentTime = 0;
    this.counter.unsubscribe();
    this.data.dc.status = 'complete';
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
      // For now this is stubbed as 15 minutes from now.
      let discussionCutoff = moment().add(15, 'minutes');

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
    this.data.audioRef.src = this.discussionService.getDiscussionPromptUrl(this.data.task, this.data.dc.id, this.activePromptId);
    this.data.audioRef.load();
    this.data.audioRef.play();
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
