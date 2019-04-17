import { Component, Inject, Input } from '@angular/core';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/base-audio-recorder';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'discussion-prompt-composer',
  templateUrl: './discussion-prompt-composer.component.html',
  styleUrls: ['./discussion-prompt-composer.component.css']
})
export class DiscussionPromptComposerComponent extends BaseAudioRecorderComponent {
  @Input() task: {};

  recordings: string[] = new Array<string>();
  audio: HTMLAudioElement;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;

  get canAddRecording(): boolean {
    return this.recordings.length < 3;
  }

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(taskService) private ts: any,
    @Inject(alertService) private alerts: any, ) {
    super(mediaRecorderService);
  }

  ngOnInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  playRecording(url: string) {
    this.audio.src = url;
    this.audio.load();
    this.audio.play();
  }

  init(): void {
    super.init();
    this.audio = <HTMLAudioElement>document.getElementById('audioDiscussionPlayer');
    this.canvas = <HTMLCanvasElement>document.getElementById('audio-recorder-visualiser');
    this.audio = <HTMLAudioElement>document.getElementById('audioPlayer');
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {
    if (this.blob && this.blob.size > 0) {
      if (this.canAddRecording) {
        this.recordings.push(URL.createObjectURL(this.blob));
      }
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
      while (i < WIDTH) {
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
