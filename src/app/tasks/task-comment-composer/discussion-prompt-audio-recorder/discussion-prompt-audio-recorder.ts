import { Inject, Input, Component, Output, EventEmitter } from '@angular/core';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/base-audio-recorder';

@Component({ selector: 'discussion-prompt-audio-recorder', templateUrl: './discussion-prompt-audio-recorder.html' })
export class DiscussionPromptAudioRecorder extends BaseAudioRecorderComponent {
  @Input() task: {};
  @Output() audioRecording = new EventEmitter<string>();
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;

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
    if (this.blob && this.blob.size > 0) {
      this.audioRecording.emit(URL.createObjectURL(this.blob));
      this.blob = <Blob>{};
      this.recordingAvailable = false;
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
      const bar_width = 0.5;
      while (i < WIDTH ) {
        const bar_x = i * 8;
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
