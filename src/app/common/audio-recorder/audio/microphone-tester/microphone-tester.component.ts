import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
} from '@angular/core';
import {Task} from 'src/app/api/models/doubtfire-model';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';
import {BaseAudioRecorderComponent} from '../base-audio-recorder';

@Component({
  selector: 'microphone-tester',
  templateUrl: './microphone-tester-component.html',
  providers: [MediaRecorderService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MicrophoneTesterComponent extends BaseAudioRecorderComponent implements AfterViewInit {
  @Input() task: Task;
  @ViewChild('micTesterAudioPlayer') audioRef: ElementRef<HTMLAudioElement>;
  @ViewChild('micTesterVisualiser') canvasRef: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;

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
    this.canvas = this.canvasRef.nativeElement;
    this.audio = this.audioRef.nativeElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {
    /* empty */
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
        this.canvasCtx.fillStyle = '#2563eb';
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
}
