import { Inject, Input, Component } from '@angular/core';
import { BaseAudioRecorderComponent } from '../base-audio-recorder';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';
import { TaskComment, TaskCommentService } from 'src/app/api/models/doubtfire-model';

@Component({ selector: 'audio-comment-recorder', templateUrl: './audio-comment-recorder.html' })
export class AudioCommentRecorderComponent extends BaseAudioRecorderComponent {
  @Input() task: {};
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(TaskCommentService) private ts: any,
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
      this.ts.addComment(this.task, this.blob, 'audio').subscribe(
        (comment: TaskComment) => {
          this.isSending = false;
          this.scrollCommentsDown();
        },
        (failure: { data: { error: any } }) => {
          this.alerts.add('danger', `Failed to post audio. ${failure.data != null ? failure.data.error : undefined}`);
          this.isSending = false;
        }
      );

      this.blob = {} as Blob;
      this.recordingAvailable = false;
    }
  }

  private scrollCommentsDown(): void {
    setTimeout(() => {
      const objDiv = document.querySelector('div.comments-body');
      // let wrappedResult = angular.element(objDiv);
      objDiv.scrollTop = objDiv.scrollHeight;
    }, 50);
  }
}
