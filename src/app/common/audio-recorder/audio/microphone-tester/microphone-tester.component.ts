import { Inject, Input, Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { BaseAudioRecorderComponent } from '../base-audio-recorder';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';

@Component({ selector: 'microphone-tester', templateUrl: './microphone-tester-component.html' })
export class MicrophoneTesterComponent extends BaseAudioRecorderComponent implements AfterViewInit {
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

  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  // We need to override default behaviour of the parent class.
  ngOnInit() { }

  init(): void {
    super.init();
    this.canvas = <HTMLCanvasElement>document.getElementById('microphone-tester-visualiser');
    this.audio = <HTMLAudioElement>document.getElementById('micTesterAudioPlayer');
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {
  }
}
