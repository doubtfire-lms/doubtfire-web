import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Task, TaskComment, TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';
import {BaseAudioRecorderComponent} from '../base-audio-recorder';

@Component({
  selector: 'audio-comment-recorder',
  templateUrl: './audio-comment-recorder.html',
  providers: [MediaRecorderService],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class AudioCommentRecorderComponent extends BaseAudioRecorderComponent implements OnInit {
  @Input() task: Task;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean = false;

  constructor(
    private mediaRecorderService: MediaRecorderService,
    private alerts: AlertService,
    private ts: TaskCommentService,
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
      this.ts.addComment(this.task, this.blob, 'audio').subscribe({
        next: (_comment: TaskComment) => {
          this.isSending = false;
          this.scrollCommentsDown();
        },
        error: (failure: {data: {error: string}}) => {
          this.alerts.error(
            `Failed to post audio. ${failure.data != null ? failure.data.error : undefined}`,
          );
          this.isSending = false;
        },
      });

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
