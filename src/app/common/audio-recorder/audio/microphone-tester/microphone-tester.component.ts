import { Input, Component, AfterViewInit } from '@angular/core';
import { BaseAudioRecorderComponent } from '../base-audio-recorder';
import { Task } from 'src/app/api/models/doubtfire-model';
import { MediaRecorderService } from 'src/app/common/services/recorder-service';

@Component({
  selector: 'microphone-tester',
  templateUrl: './microphone-tester-component.html',
  providers: [MediaRecorderService],
})
export class MicrophoneTesterComponent extends BaseAudioRecorderComponent implements AfterViewInit {
  @Input() task: Task;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(private mediaRecorderService: MediaRecorderService) {
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
