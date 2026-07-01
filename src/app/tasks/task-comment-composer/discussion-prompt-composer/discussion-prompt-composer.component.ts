import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {Task, TaskComment, TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {BaseAudioRecorderComponent} from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import {AlertService} from 'src/app/common/services/alert.service';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';

@Component({
  selector: 'discussion-prompt-composer',
  templateUrl: './discussion-prompt-composer.component.html',
  styleUrls: ['./discussion-prompt-composer.component.scss'],
  providers: [MediaRecorderService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class DiscussionPromptComposerComponent
  extends BaseAudioRecorderComponent
  implements AfterViewInit, OnDestroy
{
  @Input() task: Task;

  @ViewChild('discussionPromptComposerCanvas') canvasRef: ElementRef;
  @ViewChild('discussionPromptComposerAudio') audioRef: ElementRef;
  recordings: {blob: Blob; url: string}[] = [];
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;
  playingRecordingIndex: number = null;

  get canAddRecording(): boolean {
    return this.recordings.length < 3;
  }

  get canSendPrompt(): boolean {
    return this.recordings.length > 0 && this.blob.size === 0;
  }

  constructor(
    private mediaRecorderService: MediaRecorderService,
    @Inject(TaskCommentService) private taskCommentService: TaskCommentService,
    private alerts: AlertService,
  ) {
    super(mediaRecorderService);
  }

  // We have to use ngAfterViewInit
  // To ensure the dialog has been infalted
  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  ngOnDestroy(): void {
    this.recordings.forEach((recording) => URL.revokeObjectURL(recording.url));
  }

  init(): void {
    super.init();
    this.audio = this.audioRef.nativeElement;
    this.audio.onended = () => {
      this.playingRecordingIndex = null;
    };
    this.canvas = this.canvasRef.nativeElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  isRecordingPlaying(index: number): boolean {
    return this.playingRecordingIndex === index;
  }

  playRecording(recording: {blob: Blob; url: string}, index: number) {
    if (this.isRecordingPlaying(index)) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.playingRecordingIndex = null;
      return;
    }

    this.playingRecordingIndex = index;
    this.audio.src = recording.url;
    this.audio.load();
    this.audio.play();
  }

  deleteRecording(index: number): void {
    const [recording] = this.recordings.splice(index, 1);
    if (!recording) {
      return;
    }

    if (this.audio.src === recording.url) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.playingRecordingIndex = null;
    }

    URL.revokeObjectURL(recording.url);
  }

  saveRecording(): void {
    if (this.blob && this.blob.size > 0) {
      if (this.canAddRecording) {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
        this.playingRecordingIndex = null;
        this.recordings.push({
          blob: this.blob,
          url: URL.createObjectURL(this.blob),
        });
      }
      this.blob = new Blob();
      this.recordingAvailable = false;
    }
  }

  sendRecording(): void {
    this.isSending = true;
    this.taskCommentService
      .addComment(
        this.task,
        undefined,
        'discussion',
        undefined,
        this.recordings.map((recording) => recording.blob),
      )
      .subscribe(
        (_tc: TaskComment) => {
          this.isSending = false;
        },
        (failure: {data?: {error?: string}} | string) => {
          const message = typeof failure === 'string' ? failure : failure.data?.error || failure;
          this.alerts.error(`Failed to create discussion comment. ${String(message)}`);
          this.isSending = false;
        },
      );
    this.blob = {} as Blob;
    this.recordingAvailable = false;
  }

  visualise(): void {
    const draw = () => {
      const WIDTH = this.canvas.width;
      const HEIGHT = this.canvas.height;
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray);

      this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      let i = 0;
      const bar_width = 0.5;
      while (i < WIDTH) {
        const bar_x = i * 8;
        const bar_y = HEIGHT / 2;
        const bar_height = -(dataArray[i] / 4) + 1;
        this.canvasCtx.fillStyle = '#2563eb';
        this.canvasCtx.fillRect(bar_x, bar_y, bar_width, bar_height);
        this.canvasCtx.fillRect(bar_x, bar_y - bar_height, bar_width, bar_height);
        i++;
      }
    };

    const analyser = this.mediaRecorder.analyserNode;
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    draw();
  }
}
