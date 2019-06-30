import { Component, Inject, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { timer, Subscription } from 'rxjs';
import { IntelligentDiscussionPlayerService } from './intelligent-discussion-player.service';
import * as moment from 'moment';
import { MicrophoneTesterComponent } from 'src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './intelligent-discussion-recorder/intelligent-discussion-recorder.component';
import { taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'intelligent-discussion-player',
  templateUrl: './intelligent-discussion-player.component.html',
  styleUrls: ['./intelligent-discussion-player.component.scss']
})
export class IntelligentDiscussionPlayerComponent implements OnInit {
  @Input() task: {};
  @Input() parentCommentId: number;
  loading: boolean = false;

  constructor(@Inject(taskService) private ts: any,
    public dialog: MatDialog, ) {
  }

  ngOnInit() {
  }

  beginDiscussion(): void {
    this.loading = true;
    let dc = null;
    let dialogRef: MatDialogRef<IntelligentDiscussionDialog, any>;
    this.ts.getDiscussionComment(this.task, this.parentCommentId, (discussionComment: any) => {
      this.loading = false;
      dc = discussionComment;

      dialogRef = this.dialog.open(IntelligentDiscussionDialog, {
        data: { dc: dc },
        maxWidth: '800px',
        disableClose: true
      });

      dialogRef.afterOpened().subscribe((result: any) => {
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        console.log('The dialog was closed');
      });

    }, () => {
      console.log('fail');
    }
    );
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
  // TODO: Check that all these are needed or can be cleaned up.
  confirmed = false;
  timerText: string = '4m:00s';
  ticks: number = 0;
  startedDiscussion = false;
  audioPromptsLoaded = false;
  inDiscussion = false;
  discussionComplete: boolean = false;
  count: number = 3 * 60 * 1000; // 3 minutes
  prompts: Array<Prompt>;
  currentDiscussionPrompt: string = '';
  activePromptId: number = 0;
  counter: Subscription;
  audio: HTMLAudioElement;

  @ViewChild('testRecorder') testRecorder: MicrophoneTesterComponent;
  @ViewChild('discussionRecorder') discussionRecorder: IntelligentDiscussionRecorderComponent;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    // private discussionService: IntelligentDiscussionPlayerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    console.log(this.data);
    this.prompts = new Array<Prompt>();
    this.audio = new Audio();
  }

  disableTester() {
    this.testRecorder.stopRecording();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  finishDiscussion() {
    this.discussionComplete = true;
    this.discussionRecorder.stopRecording();
    this.audio.pause();
    this.audio = null;
    this.counter.unsubscribe();
  }

  startDiscussion() {
    if (!this.startedDiscussion) {
      // load the audio files and wait until loaded
      this.getPrompts();

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

        // every ten seconds make a blob and send to server for combining.
        if (this.ticks % 10 === 0) {
          // this.recorder.sendRecording();
        }

        if (difference === 0) {
          console.log(difference + ' No DIfference');
          this.inDiscussion = false;
          this.counter.unsubscribe();
        }

      });
    }
  }

  responseConfirmed(e: any) {
    this.activePromptId++;
    if (this.activePromptId === this.prompts[this.prompts.length - 1].id + 1) {
      this.finishDiscussion();
      return;
    }
    this.audio.src = this.prompts[this.activePromptId].url;
    this.audio.load();
    this.audio.play();
  }

  getPrompts(): void {
    // this.discussionService.GetDiscussionFiles().subscribe(response => {
    // this.prompts = response.prompts;
    this.prompts = [{
      id: 0,
      url: 'http://www.noiseaddicts.com/samples_1w72b820/160.mp3',
      responseRecorded: false
    }, {
      id: 1,
      url: 'http://www.noiseaddicts.com/samples_1w72b820/160.mp3',
      responseRecorded: false
    }, {
      id: 2,
      url: 'http://www.noiseaddicts.com/samples_1w72b820/160.mp3',
      responseRecorded: false
    }];
    this.audio.src = this.prompts[0].url;
    this.audio.load();
    this.audio.play();
    this.audioPromptsLoaded = true;
    // });
  }
}
