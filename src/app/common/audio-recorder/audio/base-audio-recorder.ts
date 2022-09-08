import { OnInit, Directive } from '@angular/core';

@Directive()
export abstract class BaseAudioRecorderComponent implements OnInit {
  protected mediaRecorder: any = null;
  public recordingAvailable: boolean = false;
  public isRecording: boolean = false;
  protected isPlaying: boolean = false;
  protected audio: HTMLAudioElement;

  abstract isSending;
  abstract canvas: HTMLCanvasElement;
  abstract canvasCtx: CanvasRenderingContext2D;

  protected blob: Blob;

  get canRecord(): boolean {
    return Boolean(navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  constructor(private mediaRecorderService: any) {}

  ngOnInit(): void {
    this.isSending = false;
    if (this.canRecord) {
      this.init();
    }
  }

  protected init(): void {
    this.blob = new Blob();
    this.mediaRecorder = new this.mediaRecorderService();
    // Required for recording multiple times
    this.mediaRecorder.config.stopTracksAndCloseCtxWhenFinished = true;
    // Required for visualising the stream
    this.mediaRecorder.config.createAnalyserNode = true;
    this.mediaRecorder.em.addEventListener('recording', (evt: any) => this.onNewRecording(evt));
  }

  playStop(): void {
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying = true;
    } else {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  recordingToggle(): void {
    if (!this.isRecording) {
      this.mediaRecorder.startRecording();
      this.visualise();
      this.isRecording = true;
    } else if (this.isRecording) {
      this.mediaRecorder.stopRecording();
      this.isRecording = false;
    }
  }

  stopRecording() {
    if (!this.audio.paused) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }

    if (this.isRecording) {
      this.mediaRecorder.stopRecording();
      this.isRecording = false;
    }
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.mediaRecorder.startRecording();
      this.visualise();
      this.isRecording = true;
    }
  }

  processChunks(): void {
    this.mediaRecorder.processChunks();
  }

  onNewRecording(evt: any): void {
    this.blob = evt.detail.recording.blob;
    this.audio.src = evt.detail.recording.blobUrl;
    this.audio.load();
    this.recordingAvailable = true;
  }

  // virtual implementation of visualise
  // Which can be overridden
  protected visualise(): void {
    const draw = () => {
      let WIDTH = this.canvas.clientWidth;
      let HEIGHT = this.canvas.clientHeight;

      this.canvas.width = 1;
      this.canvas.height = 1;

      this.canvas.width = WIDTH = this.canvas.clientWidth;
      this.canvas.height = HEIGHT = this.canvas.clientHeight;
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      analyser.getByteFrequencyData(dataArray);

      this.canvasCtx.clearRect(0, 0, 300, HEIGHT);

      const bar_width = 2;
      const bar_gap = 2;

      for (let i = 0; i < WIDTH; i++) {
        const bar_x = i * (bar_width + bar_gap);
        const bar_y = HEIGHT / 2;
        const bar_height = -(dataArray[i] / 8) + 1;
        this.canvasCtx.fillStyle = 'white';
        this.canvasCtx.fillRect(bar_x, bar_y, bar_width, bar_height);
        this.canvasCtx.fillRect(bar_x, bar_y - bar_height, bar_width, bar_height);
      }
    };

    const analyser = this.mediaRecorder.analyserNode;
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    draw();
  }

  protected abstract sendRecording(): void;
}
