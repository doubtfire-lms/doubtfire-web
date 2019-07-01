import { Component, Inject, AfterViewInit, Input } from '@angular/core';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import { IntelligentDiscussionPlayerService } from '../intelligent-discussion-player.service';
import { audioRecorderService, taskService } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'intelligent-discussion-recorder',
  templateUrl: './intelligent-discussion-recorder.component.html',
  styleUrls: ['./intelligent-discussion-recorder.component.css']
})
export class IntelligentDiscussionRecorderComponent extends BaseAudioRecorderComponent implements AfterViewInit {
  @Input() discussion: {};
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;
  intervalID: any;

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(IntelligentDiscussionPlayerService) private dps: any,
  ) {
    super(mediaRecorderService);
  }

  ngOnInit() {
    console.log(this.discussion);
  }

  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  init(): void {
    super.init();
    this.canvas = <HTMLCanvasElement>document.getElementById('mainDiscussionRecorderVisualiser');
    this.canvasCtx = this.canvas.getContext('2d');
  }

  // startStreaming() {
  // this.startRecording();
  // this.intervalID = setInterval(() => {
  // this.processChunks();
  // this.sendRecording();
  // }, 5000);
  // }

  onNewRecording(evt: any): void {
    this.blob = evt.detail.recording.blob;
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

      console.log(URL.createObjectURL(this.blob));
      this.dps.addDiscussionReply();
        // this.ts.addMediaComment(this.task, this.blob,
        //   () => {
        //     this.isSending = false;
        //   },
        //   (failure: { data: { error: any; }; }) => {
        //     this.isSending = false;
        //   });
        // console.log('Sending Recording of size ' + this.blob.size);
        this.blob = <Blob>{};
      // this.recordingAvailable = false;
    }
  }
}
