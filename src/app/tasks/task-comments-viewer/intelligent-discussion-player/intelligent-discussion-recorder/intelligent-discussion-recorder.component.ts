import {DiscussionComment, Task} from 'src/app/api/models/doubtfire-model';
import {BaseAudioRecorderComponent} from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';
import {AfterViewInit, Component, Inject, Input} from '@angular/core';
import {IntelligentDiscussionPlayerService} from '../intelligent-discussion-player.service';

@Component({
  selector: 'intelligent-discussion-recorder',
  templateUrl: './intelligent-discussion-recorder.component.html',
  styleUrls: ['./intelligent-discussion-recorder.component.css'],
  providers: [MediaRecorderService],
  standalone: false,
})
export class IntelligentDiscussionRecorderComponent
  extends BaseAudioRecorderComponent
  implements AfterViewInit
{
  @Input() discussion: DiscussionComment;
  @Input() task: Task;
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(
    private mediaRecorderService: MediaRecorderService,
    @Inject(IntelligentDiscussionPlayerService) private dps: any,
  ) {
    super(mediaRecorderService);
  }

  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  init(): void {
    super.init();
    this.canvas = document.getElementById('mainDiscussionRecorderVisualiser') as HTMLCanvasElement;
    this.canvasCtx = this.canvas.getContext('2d');
  }

  onNewRecording(evt: any): void {
    this.blob = evt.detail.recording.blob;
    this.recordingAvailable = true;
    this.sendRecording();
  }

  stopRecording() {
    this.isPlaying = false;
    if (this.isRecording) {
      this.mediaRecorder.stopRecording();
      this.isRecording = false;
    }
  }

  sendRecording() {
    if (this.blob && this.blob.size > 0) {
      this.dps.addDiscussionReply(
        this.task,
        this.discussion.id,
        this.blob,
        () => {
          this.isSending = false;
        },
        (failure: {data: {error: any}}) => {
          console.error(failure);
        },
      );
      this.blob = {} as Blob;
    }
  }
}
