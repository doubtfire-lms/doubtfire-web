import { Component, Inject, AfterViewInit, Input } from '@angular/core';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import { IntelligentDiscussionPlayerService } from '../intelligent-discussion-player.service';
import { audioRecorderService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'intelligent-discussion-recorder',
  templateUrl: './intelligent-discussion-recorder.component.html',
  styleUrls: ['./intelligent-discussion-recorder.component.css'],
})
export class IntelligentDiscussionRecorderComponent extends BaseAudioRecorderComponent implements AfterViewInit {
  @Input() discussion: any = {};
  @Input() task: {};
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(IntelligentDiscussionPlayerService) private dps: any
  ) {
    super(mediaRecorderService);
  }

  ngOnInit() {}

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
        (failure: { data: { error: any } }) => {
          console.error(failure);
        }
      );
      this.blob = {} as Blob;
    }
  }
}
