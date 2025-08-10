import { Injectable } from '@angular/core';

// Interface for the recording configuration
interface RecorderConfig {
  broadcastAudioProcessEvents: boolean;
  createAnalyserNode: boolean;
  createDynamicsCompressorNode: boolean;
  forceScriptProcessor: boolean;
  manualEncoderId: string;
  micGain: number;
  processorBufferSize: number;
  stopTracksAndCloseCtxWhenFinished: boolean;
  userMediaConstraints: MediaStreamConstraints;
  audioBitsPerSecond: number;
}

// Interface for the recording result
interface RecordingResult {
  ts: number;
  blobUrl: string;
  mimeType: string;
  size: number;
  blob: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class RecorderService {

  constructor() {
    return RecorderServiceClass as any;
  }
}

class RecorderServiceClass {
  public em: DocumentFragment = document.createDocumentFragment();

  private state: string = 'inactive';
  private audioCtx: AudioContext | null = null;
  private chunks: Blob[] = [];
  private chunkType: string = '';
  private usingMediaRecorder: boolean = false;
  private encoderMimeType: string = '';

  // Audio nodes
  private micGainNode: GainNode | null = null;
  private outputGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private dynamicsCompressorNode: DynamicsCompressorNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | AudioDestinationNode | null = null;
  private inputStreamNode: MediaStreamAudioSourceNode | null = null;

  // Media related
  private micAudioStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private encoderWorker: Worker | null = null;

  // Configuration
  private config: RecorderConfig;

  // Optional hook function
  public onGraphSetupWithInputStream?: (inputNode: MediaStreamAudioSourceNode) => void;

  constructor() {
    // Set up AudioContext with fallback for older browsers
    (window as any).AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;

    //  MediaRecorder support detection
    this.usingMediaRecorder = !!(window as any).MediaRecorder;

    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      this.usingMediaRecorder = false;
    }

    this.config = {
      broadcastAudioProcessEvents: false,
      createAnalyserNode: true,
      createDynamicsCompressorNode: false,
      forceScriptProcessor: false,
      manualEncoderId: 'wav',
      micGain: 1.0,
      processorBufferSize: 2048,
      stopTracksAndCloseCtxWhenFinished: true,
      userMediaConstraints: {
        audio: true
      },
      audioBitsPerSecond: 128000
    };
  }

  public startRecording(): Promise<void> | void {
    if (this.state !== 'inactive') {
      return;
    }

    if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return;
    }

    this.audioCtx = new AudioContext();
    this.micGainNode = this.audioCtx.createGain();
    this.outputGainNode = this.audioCtx.createGain();

    if (this.config.createDynamicsCompressorNode) {
      this.dynamicsCompressorNode = this.audioCtx.createDynamicsCompressor();
    }

    if (this.config.createAnalyserNode) {
      this.analyserNode = this.audioCtx.createAnalyser();
    }


    if (this.config.forceScriptProcessor || this.config.broadcastAudioProcessEvents || !this.usingMediaRecorder) {
      this.processorNode = this.audioCtx.createScriptProcessor(this.config.processorBufferSize, 1, 1);
    }


    if ((this.audioCtx as any).createMediaStreamDestination) {
      this.destinationNode = (this.audioCtx as any).createMediaStreamDestination();
    } else {
      this.destinationNode = this.audioCtx.destination;
    }

    if (!this.usingMediaRecorder) {
      this.encoderWorker = new Worker('/assets/wav-worker.js');
      this.encoderMimeType = 'audio/wav';

      this.encoderWorker.addEventListener('message', (e) => {
        const event = {
          data: this.config.manualEncoderId === 'ogg'
            ? e.data
            : new Blob(e.data, { type: this.encoderMimeType })
        };
        this.onDataAvailable(event);
      });
    }

    return navigator.mediaDevices.getUserMedia(this.config.userMediaConstraints)
      .then((stream) => {
        this.startRecordingWithStream(stream);
      })
      .catch(() => {
        this.em.dispatchEvent(new Event('error'));
      });
  }

  public setMicGain(newGain: number): void {
    this.config.micGain = newGain;
    if (this.audioCtx && this.micGainNode) {
      this.micGainNode.gain.setValueAtTime(newGain, this.audioCtx.currentTime);
    }
  }

  private startRecordingWithStream(stream: MediaStream): void {
    this.micAudioStream = stream;
    this.inputStreamNode = this.audioCtx!.createMediaStreamSource(this.micAudioStream);
    this.audioCtx = this.inputStreamNode.context as AudioContext;

    if (this.onGraphSetupWithInputStream) {
      this.onGraphSetupWithInputStream(this.inputStreamNode);
    }

    this.inputStreamNode.connect(this.micGainNode!);
    this.micGainNode!.gain.setValueAtTime(this.config.micGain, this.audioCtx.currentTime);

    let nextNode: AudioNode = this.micGainNode!;
    if (this.dynamicsCompressorNode) {
      this.micGainNode!.connect(this.dynamicsCompressorNode);
      nextNode = this.dynamicsCompressorNode;
    }

    this.state = 'recording';

    if (this.processorNode) {
      nextNode.connect(this.processorNode);
      this.processorNode.connect(this.outputGainNode!);
      this.processorNode.onaudioprocess = (e) => this.onAudioProcess(e);
    } else {
      nextNode.connect(this.outputGainNode!);
    }

    if (this.analyserNode) {
      nextNode.connect(this.analyserNode);
    }

    this.outputGainNode!.connect(this.destinationNode!);

    if (this.usingMediaRecorder) {
      const destinationStream = (this.destinationNode as MediaStreamAudioDestinationNode).stream;
      this.mediaRecorder = new MediaRecorder(destinationStream, { audioBitsPerSecond: this.config.audioBitsPerSecond });

      this.mediaRecorder.addEventListener('dataavailable', (evt) => {
        this.onDataAvailable(evt);
      });
      this.mediaRecorder.addEventListener('error', (evt) => {
        this.onError(evt);
      });

      this.mediaRecorder.start();
    } else {
      this.outputGainNode!.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  private onAudioProcess(e: AudioProcessingEvent): void {
    if (this.config.broadcastAudioProcessEvents) {
      this.em.dispatchEvent(new CustomEvent('onaudioprocess', {
        detail: {
          inputBuffer: e.inputBuffer,
          outputBuffer: e.outputBuffer
        }
      }));
    }

    if (!this.usingMediaRecorder) {
      if (this.state === 'recording') {
        if (this.config.broadcastAudioProcessEvents) {
          this.encoderWorker!.postMessage(['encode', e.outputBuffer.getChannelData(0)]);
        } else {
          this.encoderWorker!.postMessage(['encode', e.inputBuffer.getChannelData(0)]);
        }
      }
    }
  }

  public processChunks(): void {
    if (this.state === 'inactive') {
      return;
    }
    this.dumpChunks();
  }

  private dumpChunks(): void {
    if (this.usingMediaRecorder) {
      this.mediaRecorder!.requestData();
    }

    if (!this.usingMediaRecorder) {
      this.encoderWorker!.postMessage(['dump', this.audioCtx!.sampleRate]);
    }
  }

  // Called once when the recording has been stopped
  public stopRecording(): void {
    if (this.state === 'inactive') {
      return;
    }

    if (this.usingMediaRecorder) {
      this.state = 'inactive';
      this.mediaRecorder!.stop();
    } else {
      this.state = 'inactive';
      this.encoderWorker!.postMessage(['dump', this.audioCtx!.sampleRate]);
    }
  }

  // Called each time a chunk of recording becomes available
  private onDataAvailable(evt: { data: Blob }): void {
    this.chunks.push(evt.data);
    this.chunkType = evt.data.type;

    const blob = new Blob(this.chunks, { type: this.chunkType });
    const blobUrl = URL.createObjectURL(blob);

    const recording: RecordingResult = {
      ts: new Date().getTime(),
      blobUrl: blobUrl,
      mimeType: blob.type,
      size: blob.size,
      blob: blob
    };

    this.em.dispatchEvent(new CustomEvent('recording', { detail: { recording: recording } }));

    this.chunks = [];

    if (this.state !== 'inactive') {
      return;
    }

    this.cleanup();
  }

  private cleanup(): void {
    this.chunkType = '';

    if (this.destinationNode) {
      this.destinationNode.disconnect();
      this.destinationNode = null;
    }

    if (this.outputGainNode) {
      this.outputGainNode.disconnect();
      this.outputGainNode = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.processorNode) {
      this.processorNode.disconnect();
      this.processorNode = null;
    }

    if (this.encoderWorker) {
      this.encoderWorker.postMessage(['close']);
      this.encoderWorker = null;
    }

    if (this.dynamicsCompressorNode) {
      this.dynamicsCompressorNode.disconnect();
      this.dynamicsCompressorNode = null;
    }

    if (this.micGainNode) {
      this.micGainNode.disconnect();
      this.micGainNode = null;
    }

    if (this.inputStreamNode) {
      this.inputStreamNode.disconnect();
      this.inputStreamNode = null;
    }

    if (this.config.stopTracksAndCloseCtxWhenFinished) {
      if (this.micAudioStream) {
        this.micAudioStream.getTracks().forEach((track) => {
          track.stop();
        });
        this.micAudioStream = null;
      }

      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    }
  }

  private onError(evt: any): void {
    this.em.dispatchEvent(new Event('error'));
  }
}
