import { Component, Inject, AfterViewInit, Input, ViewChild } from '@angular/core';
import { BaseAudioRecorderComponent } from 'src/app/common/audio-recorder/audio/base-audio-recorder';
import { audioRecorderService, taskService, alertService } from 'src/app/ajs-upgraded-providers';
import { MicrophoneTesterComponent } from 'src/app/common/audio-recorder/audio/microphone-tester/microphone-tester.component';

@Component({
  selector: 'intelligent-discussion-recorder',
  templateUrl: './intelligent-discussion-recorder.component.html',
  styleUrls: ['./intelligent-discussion-recorder.component.css']
})
export class IntelligentDiscussionRecorderComponent extends BaseAudioRecorderComponent implements AfterViewInit {
  @Input() task: {};
  canvas: HTMLCanvasElement;
  canvasCtx: CanvasRenderingContext2D;
  isSending: boolean;
  intervalID: any;

  constructor(
    @Inject(audioRecorderService) mediaRecorderService: any,
    @Inject(taskService) private ts: any,
  ) {
    super(mediaRecorderService);
  }

  ngOnInit() { }

  ngAfterViewInit() {
    if (this.canRecord) {
      this.init();
    }
  }

  init(): void {
    super.init();
    this.canvas = <HTMLCanvasElement>document.getElementById('mainDiscussionRecorderVisualiser');
    this.audio = <HTMLAudioElement>document.getElementById('mainDiscussionAudioPlayer');
    this.canvasCtx = this.canvas.getContext('2d');
  }

  startStreaming() {
    this.startRecording();
    this.intervalID = setInterval(() => {
      this.processChunks();
      this.sendRecording();
    }, 5000);
  }

  stopStreaming() {
    clearInterval(this.intervalID);
    this.stopRecording();
  }

  sendRecording() {
    if (this.blob && this.blob.size > 0) {

      console.log(URL.createObjectURL(this.blob));
      // this.ts.addMediaComment(this.task, this.blob,
      //   () => {
      //     this.isSending = false;
      //   },
      //   (failure: { data: { error: any; }; }) => {
      //     this.isSending = false;
      //   });
      console.log('Sending Recording of size ' + this.blob.size);
      this.blob = <Blob>{};
      // this.recordingAvailable = false;
    }
  }
}
