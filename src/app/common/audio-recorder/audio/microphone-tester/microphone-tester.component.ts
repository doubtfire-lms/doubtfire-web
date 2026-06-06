import {Task} from 'src/app/api/models/doubtfire-model';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';
import {AfterViewInit, Component, Input} from '@angular/core';
import {BaseAudioRecorderComponent} from '../base-audio-recorder';

@Component({
  selector: 'microphone-tester',
  templateUrl: './microphone-tester-component.html',
  providers: [MediaRecorderService],
  standalone: false,
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

  init(): void {
    super.init();
    this.canvas = document.getElementById('micTesterVisualiser') as HTMLCanvasElement;
    this.audio = document.getElementById('micTesterAudioPlayer') as HTMLAudioElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {
    /* empty */
  }
}
