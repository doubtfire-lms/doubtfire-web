import {Injectable} from '@angular/core';

type RecorderState = 'inactive' | 'recording';

interface RecorderConfig {
  broadcastAudioProcessEvents: boolean;
  createAnalyserNode: boolean;
  createDynamicsCompressorNode: boolean;
  forceScriptProcessor: boolean;
  manualEncoderId: 'wav' | 'ogg';
  micGain: number;
  processorBufferSize: number;
  stopTracksAndCloseCtxWhenFinished: boolean;
  userMediaConstraints: MediaStreamConstraints;
  audioBitsPerSecond: number;
}

@Injectable()
export class MediaRecorderService {
  em: DocumentFragment;
  state: RecorderState;
  audioCtx: AudioContext | null;
  chunks: BlobPart[];
  chunkType: string | null;
  usingMediaRecorder: boolean;
  encoderMimeType?: string;
  config: RecorderConfig;

  micGainNode: GainNode | null;
  outputGainNode: GainNode | null;
  dynamicsCompressorNode: DynamicsCompressorNode | null;
  analyserNode: AnalyserNode | null;
  processorNode: ScriptProcessorNode | null;
  destinationNode: MediaStreamAudioDestinationNode | AudioDestinationNode | null;
  encoderWorker: Worker | null;
  micAudioStream: MediaStream | null;
  inputStreamNode: MediaStreamAudioSourceNode | null;
  mediaRecorder: MediaRecorder | null;
  onGraphSetupWithInputStream?: (inputStream: MediaStreamAudioSourceNode) => void;

  constructor() {
    const audioWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    audioWindow.AudioContext = audioWindow.AudioContext || audioWindow.webkitAudioContext;

    this.em = document.createDocumentFragment();
    this.state = 'inactive';
    this.audioCtx = null;
    this.chunks = [];
    this.chunkType = '';

    this.micGainNode = null;
    this.outputGainNode = null;
    this.dynamicsCompressorNode = null;
    this.analyserNode = null;
    this.processorNode = null;
    this.destinationNode = null;
    this.encoderWorker = null;
    this.micAudioStream = null;
    this.inputStreamNode = null;
    this.mediaRecorder = null;

    this.usingMediaRecorder = Boolean(window.MediaRecorder);

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
        audio: true,
      },
      audioBitsPerSecond: 128000,
    };
  }

  startRecording(): Promise<void> | void {
    if (this.state !== 'inactive') {
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      console.error('Missing support for navigator.mediaDevices.getUserMedia');
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

    if (
      this.config.forceScriptProcessor ||
      this.config.broadcastAudioProcessEvents ||
      !this.usingMediaRecorder
    ) {
      this.processorNode = this.audioCtx.createScriptProcessor(
        this.config.processorBufferSize,
        1,
        1,
      );
    }

    if (this.audioCtx.createMediaStreamDestination) {
      this.destinationNode = this.audioCtx.createMediaStreamDestination();
    } else {
      this.destinationNode = this.audioCtx.destination;
    }

    if (!this.usingMediaRecorder) {
      this.encoderWorker = new Worker('/assets/wav-worker.js');
      this.encoderMimeType = 'audio/wav';

      this.encoderWorker.addEventListener('message', (e: MessageEvent<BlobPart[] | Blob>) => {
        const event = new Event('dataavailable') as Event & {data: Blob};
        if (this.config.manualEncoderId === 'ogg') {
          event.data = e.data as Blob;
        } else {
          event.data = new Blob(e.data as BlobPart[], {type: this.encoderMimeType});
        }
        this._onDataAvailable(event);
      });
    }

    return navigator.mediaDevices
      .getUserMedia(this.config.userMediaConstraints)
      .then((stream) => {
        this._startRecordingWithStream(stream);
      })
      .catch(() => undefined);
  }

  setMicGain(newGain: number): void {
    this.config.micGain = newGain;
    if (this.audioCtx && this.micGainNode) {
      this.micGainNode.gain.setValueAtTime(newGain, this.audioCtx.currentTime);
    }
  }

  processChunks(): void {
    if (this.state === 'inactive') {
      return;
    }
    this._dumpChunks();
  }

  stopRecording(): void {
    if (this.state === 'inactive') {
      return;
    }
    this.state = 'inactive';

    if (this.usingMediaRecorder) {
      this.mediaRecorder?.stop();
      return;
    }

    this.encoderWorker?.postMessage(['dump', this.audioCtx?.sampleRate]);
  }

  private _startRecordingWithStream(stream: MediaStream): void {
    if (!this.audioCtx || !this.micGainNode || !this.outputGainNode || !this.destinationNode) {
      return;
    }

    this.micAudioStream = stream;
    this.inputStreamNode = this.audioCtx.createMediaStreamSource(this.micAudioStream);
    this.audioCtx = this.inputStreamNode.context as AudioContext;

    this.onGraphSetupWithInputStream?.(this.inputStreamNode);

    this.inputStreamNode.connect(this.micGainNode);
    this.micGainNode.gain.setValueAtTime(this.config.micGain, this.audioCtx.currentTime);

    let nextNode: AudioNode = this.micGainNode;
    if (this.dynamicsCompressorNode) {
      this.micGainNode.connect(this.dynamicsCompressorNode);
      nextNode = this.dynamicsCompressorNode;
    }

    this.state = 'recording';

    if (this.processorNode) {
      nextNode.connect(this.processorNode);
      this.processorNode.connect(this.outputGainNode);
      this.processorNode.onaudioprocess = (e: AudioProcessingEvent) => this._onAudioProcess(e);
    } else {
      nextNode.connect(this.outputGainNode);
    }

    if (this.analyserNode) {
      nextNode.connect(this.analyserNode);
    }

    this.outputGainNode.connect(this.destinationNode);

    if (this.usingMediaRecorder) {
      const streamDestination = this.destinationNode as MediaStreamAudioDestinationNode;
      this.mediaRecorder = new MediaRecorder(streamDestination.stream, {
        audioBitsPerSecond: this.config.audioBitsPerSecond,
      });
      this.mediaRecorder.addEventListener('dataavailable', (evt) => this._onDataAvailable(evt));
      this.mediaRecorder.addEventListener('error', (evt) => this._onError(evt));
      this.mediaRecorder.start();
    } else {
      this.outputGainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    }
  }

  private _onAudioProcess(e: AudioProcessingEvent): void {
    if (this.config.broadcastAudioProcessEvents) {
      this.em.dispatchEvent(
        new CustomEvent('onaudioprocess', {
          detail: {
            inputBuffer: e.inputBuffer,
            outputBuffer: e.outputBuffer,
          },
        }),
      );
    }

    if (!this.usingMediaRecorder && this.state === 'recording' && this.encoderWorker) {
      if (this.config.broadcastAudioProcessEvents) {
        this.encoderWorker.postMessage(['encode', e.outputBuffer.getChannelData(0)]);
      } else {
        this.encoderWorker.postMessage(['encode', e.inputBuffer.getChannelData(0)]);
      }
    }
  }

  private _dumpChunks(): void {
    if (this.usingMediaRecorder) {
      this.mediaRecorder?.requestData();
      return;
    }

    this.encoderWorker?.postMessage(['dump', this.audioCtx?.sampleRate]);
  }

  private _onDataAvailable(evt: BlobEvent | (Event & {data: Blob})): void {
    this.chunks.push(evt.data);
    this.chunkType = evt.data.type;

    const blob = new Blob(this.chunks, {type: this.chunkType});
    const blobUrl = URL.createObjectURL(blob);
    const recording = {
      ts: new Date().getTime(),
      blobUrl,
      mimeType: blob.type,
      size: blob.size,
      blob,
    };

    this.em.dispatchEvent(new CustomEvent('recording', {detail: {recording}}));

    this.chunks = [];

    if (this.state !== 'inactive') {
      return;
    }

    this._cleanup();
  }

  private _cleanup(): void {
    this.chunkType = null;

    this.destinationNode?.disconnect();
    this.destinationNode = null;

    this.outputGainNode?.disconnect();
    this.outputGainNode = null;

    this.analyserNode?.disconnect();
    this.analyserNode = null;

    this.processorNode?.disconnect();
    this.processorNode = null;

    if (this.encoderWorker) {
      this.encoderWorker.postMessage(['close']);
      this.encoderWorker = null;
    }

    this.dynamicsCompressorNode?.disconnect();
    this.dynamicsCompressorNode = null;

    this.micGainNode?.disconnect();
    this.micGainNode = null;

    this.inputStreamNode?.disconnect();
    this.inputStreamNode = null;

    if (this.config.stopTracksAndCloseCtxWhenFinished) {
      this.micAudioStream?.getTracks().forEach((track) => track.stop());
      this.micAudioStream = null;

      this.audioCtx?.close();
      this.audioCtx = null;
    }

    this.mediaRecorder = null;
  }

  private _onError(_evt: Event): void {
    this.em.dispatchEvent(new Event('error'));
  }
}
