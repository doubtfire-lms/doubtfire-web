import { Inject, Input, Component, AfterViewInit } from '@angular/core';
import { BaseAudioRecorderComponent } from '../base-audio-recorder';
import { audioRecorderService } from 'src/app/ajs-upgraded-providers';

@Component({ selector: 'microphone-tester', templateUrl: './microphone-tester-component.html' })
export class MicrophoneTesterComponent extends BaseAudioRecorderComponent implements AfterViewInit {
  @Input() task: {};
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(@Inject(audioRecorderService) mediaRecorderService: any) {
    super(mediaRecorderService);
  }

  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  // We need to override default behaviour of the parent class.
  ngOnInit() {}

  init(): void {
    super.init();
    this.canvas = document.getElementById('micTesterVisualiser') as HTMLCanvasElement;
    this.audio = document.getElementById('micTesterAudioPlayer') as HTMLAudioElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {}
}
