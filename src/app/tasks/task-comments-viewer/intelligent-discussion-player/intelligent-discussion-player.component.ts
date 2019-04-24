import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { timer, Subscription } from 'rxjs';
import { IntelligentDiscussionPlayerService } from './intelligent-discussion-player.service';
import * as moment from 'moment';
import { MicrophoneTesterComponent } from 'src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import { IntelligentDiscussionRecorderComponent } from './intelligent-discussion-recorder/intelligent-discussion-recorder.component';


@Component({
  selector: 'intelligent-discussion-player',
  templateUrl: './intelligent-discussion-player.component.html',
  styleUrls: ['./intelligent-discussion-player.component.scss']
})
export class IntelligentDiscussionPlayerComponent {
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;
  constructor(public dialog: MatDialog, ) {
  }

  ngOnInit() {

  }

  sendRecording(): void { }

  beginDiscussion(): void {
    const dialogRef = this.dialog.open(IntelligentDiscussionDialog, {
      maxWidth: '800px',
      disableClose: true,
    });

    dialogRef.afterOpened().subscribe((result: any) => {
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('The dialog was closed');
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
  @ViewChild('testRecorder') testRecorder: MicrophoneTesterComponent;
  @ViewChild('discussionRecorder') discussionRecorder: IntelligentDiscussionRecorderComponent;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    private discussionService: IntelligentDiscussionPlayerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit() {
    this.prompts = new Array<Prompt>();
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
    this.counter.unsubscribe();
  }

  startDiscussion() {
    if (!this.startedDiscussion) {
      // load the audio files and wait until loaded
      this.getPrompts();

      // start recording
      this.discussionRecorder.startStreaming();

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
    }
  }

  getPrompts(): void {
    this.discussionService.GetDiscussionFiles().subscribe(response => {
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
      this.audioPromptsLoaded = true;
    });
  }
}
