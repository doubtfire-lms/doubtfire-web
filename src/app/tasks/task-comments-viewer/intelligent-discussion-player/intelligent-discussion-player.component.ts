import moment from 'moment';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subscription, timer} from 'rxjs';
import {DiscussionComment, Task} from 'src/app/api/models/doubtfire-model';
import {AudioPlayerComponent} from 'src/app/common/audio-player/audio-player.component';
import {MicrophoneTesterComponent} from 'src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';
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
export class IntelligentDiscussionPlayerComponent {
  @Input() discussion: DiscussionComment;
  @Input() task: Task;
  @ViewChild('player') audioPlayer: AudioPlayerComponent;
  loading: boolean = false;
  audioProgress: number = 0;
  selectedTrackLabel = 'Response';
  selectedTrackKey = 'response';
  audioPlaying = false;

  constructor(
    public dialog: MatDialog,
    private discussionService: IntelligentDiscussionPlayerService,
    private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
  ) {}

  get responseAvailable() {
    return this.discussion.status === 'complete';
  }

  get isNotStudent() {
    return this.task.unit.currentUserIsStaff;
  }

  get promptNumbers(): number[] {
    return Array.from({length: this.discussion.numberOfPrompts}, (_, index) => index);
  }

  promptTrackKey(promptNumber: number): string {
    return `prompt-${promptNumber}`;
  }

  isTrackPlaying(trackKey: string): boolean {
    return this.selectedTrackKey === trackKey && this.audioPlaying;
  }

  togglePromptTrack(promptNumber: number): void {
    const trackKey = this.promptTrackKey(promptNumber);
    if (this.isTrackPlaying(trackKey)) {
      this.audioPlayer?.stop();
      return;
    }

    this.setPromptTrack('prompt', promptNumber);
  }

  toggleResponseTrack(): void {
    if (this.isTrackPlaying('response')) {
      this.audioPlayer?.stop();
      return;
    }

    this.setPromptTrack('response');
  }

  setPromptTrack(track: string, promptNumber?: number) {
    let url: string;
    if (track === 'prompt') {
      url = this.discussion.generateDiscussionPromptUrl(promptNumber);
      this.selectedTrackLabel = `Prompt ${promptNumber + 1}`;
      this.selectedTrackKey = this.promptTrackKey(promptNumber);
    } else {
      url = this.discussion.responseUrl;
      this.selectedTrackLabel = 'Response';
      this.selectedTrackKey = 'response';
    }

    this.fileDownloader.downloadBlob(
      url,
      (blobUrl) => {
        if (!this.audioPlayer) {
          return;
        }

        this.audioPlayer.setSrc(blobUrl);
        this.audioPlayer.play();
      },
      (error) => {
        this.alerts.error(`Error loading discussion audio. ${error}`, 6000);
      },
    );
  }

  beginDiscussion(): void {
    const dialogRef: MatDialogRef<IntelligentDiscussionDialog, void> = this.dialog.open(
      IntelligentDiscussionDialog,
      {
        data: {
          dc: this.discussion,
          task: this.task,
          audioRef: new Audio(),
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
export class IntelligentDiscussionDialog implements OnDestroy {
  confirmed = false;
  timerText: string = '15m:00s';
  ticks: number = 0;
  startedDiscussion = false;
  inDiscussion = false;
  discussionComplete: boolean = false;
  promptLoading = false;
  promptPlaying = false;
  responseRecording = false;
  countdownValue: number = null;
  count: number = 3 * 60 * 1000; // 3 minutes
  activePromptId: number = 0;
  counter: Subscription;
  private countdownTimer: ReturnType<typeof setInterval>;
  guide = {text: 'Click start to begin'};
  private promptBlobUrl: string;

  @ViewChild('testRecorder', {static: true}) testRecorder: MicrophoneTesterComponent;
  @ViewChild('discussionRecorder', {static: true})
  discussionRecorder: IntelligentDiscussionRecorderComponent;

  constructor(
    public dialogRef: MatDialogRef<IntelligentDiscussionDialog>,
    private discussionService: IntelligentDiscussionPlayerService,
    private fileDownloader: FileDownloaderService,
    private alerts: AlertService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      dc: DiscussionComment;
      task: Task;
      audioRef: HTMLAudioElement;
    },
  ) {}

  ngOnDestroy(): void {
    this.counter?.unsubscribe();
    this.clearCountdown();
    this.data.audioRef.pause();
    this.releasePromptBlob();
  }

  disableTester() {
    this.testRecorder.stopRecording();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get numberOfPrompts(): number {
    return this.data.dc.numberOfPrompts;
  }

  get canAdvancePrompt(): boolean {
    return this.inDiscussion && this.responseRecording;
  }

  get discussionStatusTitle(): string {
    if (this.countdownValue) {
      return 'Starting discussion';
    }
    if (!this.startedDiscussion) {
      return 'Ready when you are';
    }
    if (this.promptLoading) {
      return 'Loading prompt';
    }
    if (this.promptPlaying) {
      return `Listening to prompt ${this.activePromptId + 1}`;
    }
    if (this.responseRecording) {
      return 'Respond now';
    }
    if (this.discussionComplete) {
      return 'Discussion complete';
    }
    return 'Discussion in progress';
  }

  get discussionStatusHint(): string {
    if (this.countdownValue) {
      return 'Get ready. Recording will begin when the countdown finishes.';
    }
    if (!this.startedDiscussion) {
      return 'When you start, your microphone will begin recording and the first prompt will play.';
    }
    if (this.promptLoading) {
      return 'Getting the next tutor prompt ready.';
    }
    if (this.promptPlaying) {
      return 'Listen carefully. Wait for the tone before responding.';
    }
    if (this.responseRecording) {
      return 'Speak your answer now. When you are ready, move to the next prompt or finish the discussion.';
    }
    if (this.discussionComplete) {
      return 'Your response has been recorded. Select Complete to close out the discussion.';
    }
    return '';
  }

  finishDiscussion() {
    this.discussionComplete = true;
    this.inDiscussion = false;
    this.promptLoading = false;
    this.promptPlaying = false;
    this.responseRecording = false;
    this.clearCountdown();
    this.guide = {text: ''};
    this.discussionRecorder.stopRecording();
    this.data.audioRef.pause();
    this.data.audioRef.currentTime = 0;
    this.counter?.unsubscribe();
    this.data.dc.status = 'complete';
  }

  startDiscussion() {
    if (!this.startedDiscussion) {
      this.startedDiscussion = true;
      this.inDiscussion = true;
      this.startCountdown();
    }
  }

  private beginRecordingAndFirstPrompt(): void {
    // start recording
    this.discussionRecorder.startRecording();

    this.setPrompt();

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

  private startCountdown(): void {
    this.countdownValue = 3;
    this.guide.text = 'Starting discussion';

    this.countdownTimer = setInterval(() => {
      this.countdownValue--;

      if (this.countdownValue <= 0) {
        this.clearCountdown();
        this.beginRecordingAndFirstPrompt();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = undefined;
    }
    this.countdownValue = null;
  }

  setPrompt() {
    this.promptLoading = true;
    this.promptPlaying = false;
    this.responseRecording = false;
    this.guide.text = 'Loading prompt';
    this.data.audioRef.pause();
    this.releasePromptBlob();

    this.fileDownloader.downloadBlob(
      this.data.dc.generateDiscussionPromptUrl(this.activePromptId),
      (blobUrl) => {
        this.promptBlobUrl = blobUrl;
        this.data.audioRef.src = blobUrl;
        this.guide.text = 'Listening to prompt';
        this.promptLoading = false;
        this.promptPlaying = true;
        this.data.audioRef.load();
        this.data.audioRef.play();
        this.data.audioRef.onended = () => {
          this.promptPlaying = false;
          const audio = new Audio();
          audio.src = '/assets/sounds/discussion-start-signal.wav';
          audio.load();
          audio.play();
          this.guide.text = 'Start responding';
          this.responseRecording = true;
        };
      },
      (error) => {
        this.promptLoading = false;
        this.promptPlaying = false;
        this.responseRecording = false;
        this.guide.text = 'Unable to load prompt';
        this.alerts.error(`Error loading discussion prompt. ${error}`, 6000);
      },
    );
  }

  responseConfirmed(_event: Event) {
    if (this.activePromptId !== this.numberOfPrompts - 1) {
      this.activePromptId++;
      this.setPrompt();
    } else {
      this.finishDiscussion();
    }
  }

  private releasePromptBlob(): void {
    if (this.promptBlobUrl) {
      this.fileDownloader.releaseBlob(this.promptBlobUrl);
      this.promptBlobUrl = undefined;
    }
  }
}
