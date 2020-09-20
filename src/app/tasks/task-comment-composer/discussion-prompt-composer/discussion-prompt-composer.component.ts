import { Component, Inject, Input, ViewChild, ElementRef } from '@angular/core';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'discussion-prompt-composer',
  templateUrl: './discussion-prompt-composer.component.html',
  styleUrls: ['./discussion-prompt-composer.component.scss'],
})
export class DiscussionPromptComposerComponent extends BaseAudioRecorderComponent {
  @Input() task: {};
  @ViewChild('discussionPromptComposerCanvas', { static: true }) canvasRef: ElementRef;
  @ViewChild('discussionPromptComposerAudio', { static: true }) audioRef: ElementRef;
  recordings: Blob[] = new Array<Blob>();
  audio: HTMLAudioElement;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;

  get canAddRecording(): boolean {
    return this.recordings.length < 3;
  }

  get canSendPrompt(): boolean {
    return this.recordings.length > 0 && this.blob.size === 0;
  }

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(taskService) private ts: any,
    @Inject(alertService) private alerts: any
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

  init(): void {
    super.init();
    this.audio = this.audioRef.nativeElement;
    this.canvas = this.canvasRef.nativeElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  getUrl(b: Blob) {
    return URL.createObjectURL(b);
  }

  playRecording(url: string) {
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }

  saveRecording(): void {
    if (this.blob && this.blob.size > 0) {
      if (this.canAddRecording) {
        this.recordings.push(this.blob);
      }
      this.blob = new Blob();
      this.recordingAvailable = false;
    }
  }

  sendRecording(): void {
    this.ts.addDiscussionComment(
      this.task,
      this.recordings,
      () => {
        this.ts.scrollDown();
        this.isSending = false;
      },
      (failure: { data: { error: any } }) => {
        this.alerts.add('danger', `Failed to post audio. ${failure.data != null ? failure.data.error : undefined}`);
        this.isSending = false;
      }
    );
    this.blob = {} as Blob;
    this.recordingAvailable = false;
    this.ts.scrollDown();
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
