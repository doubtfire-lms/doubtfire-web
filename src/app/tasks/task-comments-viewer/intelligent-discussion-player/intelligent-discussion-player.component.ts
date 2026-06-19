import moment from 'moment';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subscription, timer} from 'rxjs';
import {DiscussionComment, Task} from 'src/app/api/models/doubtfire-model';
import {AudioPlayerComponent} from 'src/app/common/audio-player/audio-player.component';
import {MicrophoneTesterComponent} from 'src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import {IntelligentDiscussionPlayerService} from './intelligent-discussion-player.service';
import {IntelligentDiscussionRecorderComponent} from './intelligent-discussion-recorder/intelligent-discussion-recorder.component';

@Component({
  selector: 'intelligent-discussion-player',
  templateUrl: './intelligent-discussion-player.component.html',
  styleUrls: ['./intelligent-discussion-player.component.scss'],
  providers: [IntelligentDiscussionPlayerService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class IntelligentDiscussionPlayerComponent implements AfterViewInit {
  @Input() discussion: DiscussionComment;
  @Input() task: Task;
  @ViewChild('player') audioPlayer: AudioPlayerComponent;
  loading: boolean = false;
  audioProgress: number = 0;

  constructor(
    public dialog: MatDialog,
    private discussionService: IntelligentDiscussionPlayerService,
  ) {}

  ngAfterViewInit() {
    this.setPromptTrack('response');
  }

  get responseAvailable() {
    return this.discussion.status === 'complete';
  }

  get isNotStudent() {
    return this.task.unit.currentUserIsStaff;
  }

  setPromptTrack(track: string, promptNumber?: number) {
    let url: string;
    if (track === 'prompt') {
      url = this.discussion.generateDiscussionPromptUrl(promptNumber);
    } else {
      url = this.discussion.responseUrl;
    }

    this.audioPlayer.setSrc(url);
  }

  beginDiscussion(): void {
    const dialogRef: MatDialogRef<IntelligentDiscussionDialog, void> = this.dialog.open(
      IntelligentDiscussionDialog,
      {
        data: {
          dc: this.discussion,
          task: this.task,
          audioRef: this.audioPlayer.audio,
        },
        maxWidth: '800px',
        disableClose: true,
      },
    );

    dialogRef.afterOpened().subscribe();

    dialogRef.afterClosed().subscribe();
  }
}

// The Dialog Component
// eslint-disable-next-line max-classes-per-file
@Component({
  selector: 'intelligent-discussion-dialog',
  templateUrl: 'intelligent-discussion-dialog.html',
  styleUrls: ['./intelligent-discussion-player.component.scss'],
  providers: [IntelligentDiscussionPlayerService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class IntelligentDiscussionDialog {
  confirmed = false;
  timerText: string = '15m:00s';
  ticks: number = 0;
  startedDiscussion = false;
  inDiscussion = false;
  discussionComplete: boolean = false;
  count: number = 3 * 60 * 1000; // 3 minutes
  activePromptId: number = 0;
  counter: Subscription;
  guide = {text: 'Click start to begin'};

  @ViewChild('testRecorder', {static: true}) testRecorder: MicrophoneTesterComponent;
  @ViewChild('discussionRecorder', {static: true})
  discussionRecorder: IntelligentDiscussionRecorderComponent;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    private discussionService: IntelligentDiscussionPlayerService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dc: DiscussionComment;
      task: Task;
      audioRef: HTMLAudioElement;
    },
  ) {}

  disableTester() {
    this.testRecorder.stopRecording();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get numberOfPrompts(): number {
    return this.data.dc.numberOfPrompts;
  }

  finishDiscussion() {
    this.discussionComplete = true;
    this.inDiscussion = false;
    this.guide = {text: ''};
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
      const discussionCutoff = moment().add(15, 'minutes');

      this.counter = timer(0, 1000).subscribe((val) => {
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
    this.data.audioRef.src = this.data.dc.generateDiscussionPromptUrl(this.activePromptId);
    this.guide.text = 'Listening to prompt';
    this.data.audioRef.load();
    this.data.audioRef.play();
    this.data.audioRef.addEventListener('ended', () => {
      setTimeout(() => {
        const audio = new Audio();
        audio.src = '/assets/sounds/discussion-start-signal.wav';
        audio.load();
        audio.play();
        this.guide.text = 'Start responding';
      }, 400);
    });
  }

  responseConfirmed(_event: Event) {
    if (this.activePromptId !== this.numberOfPrompts - 1) {
      this.activePromptId++;
      this.setPrompt();
    } else {
      this.finishDiscussion();
    }
  }
}
