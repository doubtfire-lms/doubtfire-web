import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import {DiscussionComment, Task} from 'src/app/api/models/doubtfire-model';
import {TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {
  BaseAudioRecorderComponent,
  RecordingEvent,
} from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';

@Component({
  selector: 'intelligent-discussion-recorder',
  templateUrl: './intelligent-discussion-recorder.component.html',
  styleUrls: ['./intelligent-discussion-recorder.component.css'],
  providers: [MediaRecorderService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class IntelligentDiscussionRecorderComponent
  extends BaseAudioRecorderComponent
  implements AfterViewInit
{
  @Input() countdownText: number;
  @Input() discussion: DiscussionComment;
  @Input() promptActive = false;
  @Input() task: Task;
  @ViewChild('mainDiscussionRecorderVisualiser') canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;

  constructor(
    private mediaRecorderService: MediaRecorderService,
    private taskCommentService: TaskCommentService,
  ) {
    super(mediaRecorderService);
  }

  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  init(): void {
    super.init();
    this.canvas = this.canvasRef.nativeElement;
    this.canvasCtx = this.canvas.getContext('2d');
    this.clearWaveform();
  }

  onNewRecording(evt: RecordingEvent): void {
    this.blob = evt.detail.recording.blob;
    this.recordingAvailable = true;
    this.sendRecording();
  }

  stopRecording() {
    this.isPlaying = false;
    if (this.isRecording) {
      this.mediaRecorder.stopRecording();
      this.isRecording = false;
      this.clearWaveform();
    }
  }

  sendRecording() {
    if (this.blob && this.blob.size > 0) {
      this.isSending = true;
      this.taskCommentService.postDiscussionReply(this.discussion, this.blob).subscribe({
        next: () => {
          this.isSending = false;
        },
        error: (failure: {data: {error: string}}) => {
          console.error(failure);
          this.isSending = false;
        },
      });
      this.blob = {} as Blob;
    }
  }

  protected visualise(): void {
    const draw = () => {
      let WIDTH: number;
      let HEIGHT: number;

      this.canvas.width = 1;
      this.canvas.height = 1;

      this.canvas.width = WIDTH = this.canvas.clientWidth;
      this.canvas.height = HEIGHT = this.canvas.clientHeight;
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray);

      this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      const barWidth = 2;
      const barGap = 2;

      for (let i = 0; i < WIDTH; i++) {
        const barX = i * (barWidth + barGap);
        const barY = HEIGHT / 2;
        const barHeight = -(dataArray[i] / 8) + 1;
        this.canvasCtx.fillStyle = this.waveformColour;
        this.canvasCtx.fillRect(barX, barY, barWidth, barHeight);
        this.canvasCtx.fillRect(barX, barY - barHeight, barWidth, barHeight);
      }
    };

    const analyser = this.mediaRecorder.analyserNode;
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    draw();
  }

  private get waveformColour(): string {
    if (!this.isRecording) {
      return '#2563eb';
    }

    return this.promptActive ? '#b91c1c66' : '#dc2626';
  }

  private clearWaveform(): void {
    if (!this.canvas || !this.canvasCtx) {
      return;
    }

    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
