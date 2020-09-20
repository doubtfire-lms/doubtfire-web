import { Inject, Input, Component } from '@angular/core';
import { BaseAudioRecorderComponent } from '../base-audio-recorder';
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
    @Inject(alertService) private alerts: any
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
    this.canvas = document.getElementById('audio-recorder-visualiser') as HTMLCanvasElement;
    this.audio = document.getElementById('audioPlayer') as HTMLAudioElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  sendRecording(): void {
    this.isSending = true;
    if (this.blob && this.blob.size > 0) {
      this.ts.addMediaComment(
        this.task,
        this.blob,
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
  }
}
