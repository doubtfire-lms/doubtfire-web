import { Inject, Input, Component } from '@angular/core';
import { BaseAudioRecorderComponent } from './base-audio-recorder';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';

@Component({ selector: 'audio-comment-recorder', templateUrl: './audio-comment-recorder.html' })
export class AudioCommentRecorderComponent extends BaseAudioRecorderComponent {
  @Input() task: {};
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(taskService) private ts: any,
    @Inject(alertService) private alerts: any,
  ) {
    super(mediaRecorderService);
  }
  ngOnInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  init(): void {
    super.init();
    this.canvas = <HTMLCanvasElement>document.getElementById('audio-recorder-visualiser');
    this.audio = <HTMLAudioElement>document.getElementById('audioPlayer');
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {
    this.isSending = true;
    if (this.blob && this.blob.size > 0) {
      this.ts.addMediaComment(this.task, this.blob,
        () => {
          this.ts.scrollDown();
          this.isSending = false;
        },
        (failure: { data: { error: any; }; }) => {
          this.alerts.add('danger', `Failed to post audio. ${(failure.data != null ? failure.data.error : undefined)}`);
          this.isSending = false;
        });
      this.blob = <Blob>{};
      this.recordingAvailable = false;
      this.ts.scrollDown();
    }
  }

  visualise(): void {
    let draw = () => {
      const WIDTH = this.canvas.width;
      const HEIGHT = this.canvas.height;
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray);

      this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      let i = 0;
      const bar_width = 1;
      while (i < WIDTH) {
        const bar_x = i * 10;
        const bar_y = HEIGHT / 2;
        const bar_height = -(dataArray[i] / 4) + 1;
        this.canvasCtx.fillRect(bar_x, bar_y, bar_width, bar_height);
        this.canvasCtx.fillRect(bar_x, bar_y - bar_height, bar_width, bar_height);
        i++;
      }
    };

    let analyser = this.mediaRecorder.analyserNode;
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    draw();
  }
}
