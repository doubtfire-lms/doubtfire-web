import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {of} from 'rxjs';
import {Task, TaskComment, TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {AlertService} from 'src/app/common/services/alert.service';
import {MediaRecorderService} from 'src/app/common/services/recorder-service';
import {DiscussionPromptComposerComponent} from './discussion-prompt-composer.component';

class TestableDiscussionPromptComposerComponent extends DiscussionPromptComposerComponent {
  set testAudio(audio: HTMLAudioElement) {
    this.audio = audio;
  }

  get testAudio(): HTMLAudioElement {
    return this.audio;
  }

  set testBlob(blob: Blob) {
    this.blob = blob;
  }

  get testBlob(): Blob {
    return this.blob;
  }
}

describe('DiscussionPromptComposerComponent', () => {
  let component: TestableDiscussionPromptComposerComponent;
  let taskCommentService: {addComment: ReturnType<typeof vi.fn>};
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let originalCreateObjectURL: typeof URL.createObjectURL;
  let originalRevokeObjectURL: typeof URL.revokeObjectURL;

  beforeEach(() => {
    originalCreateObjectURL = URL.createObjectURL;
    originalRevokeObjectURL = URL.revokeObjectURL;
    createObjectURL = vi.fn((blob: Blob) => `blob:${blob.size}:${blob.type}`);
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: createObjectURL});
    Object.defineProperty(URL, 'revokeObjectURL', {configurable: true, value: revokeObjectURL});

    taskCommentService = {
      addComment: vi.fn(() => of({} as TaskComment)),
    };
    component = new TestableDiscussionPromptComposerComponent(
      {} as MediaRecorderService,
      taskCommentService as unknown as TaskCommentService,
      {error: vi.fn()} as unknown as AlertService,
    );
    component.task = {id: 1} as Task;
    component.testAudio = {
      src: '',
      pause: vi.fn(),
      removeAttribute: vi.fn(function (this: {src: string}, attribute: string) {
        if (attribute === 'src') {
          this.src = '';
        }
      }),
      load: vi.fn(),
      play: vi.fn(),
    } as unknown as HTMLAudioElement;
  });

  afterEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: originalCreateObjectURL,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: originalRevokeObjectURL,
    });
  });

  it('saves a recording as a reusable object URL and clears the active blob', () => {
    const recording = new Blob(['prompt one'], {type: 'audio/webm'});
    component.testBlob = recording;
    component.recordingAvailable = true;

    component.saveRecording();

    expect(component.recordings).toEqual([{blob: recording, url: 'blob:10:audio/webm'}]);
    expect(createObjectURL).toHaveBeenCalledWith(recording);
    expect(component.testBlob.size).toBe(0);
    expect(component.recordingAvailable).toBe(false);
  });

  it('deletes a saved prompt and revokes its object URL', () => {
    const recording = {blob: new Blob(['prompt one']), url: 'blob:prompt-one'};
    component.recordings = [recording];
    component.testAudio.src = recording.url;
    component.playingRecordingIndex = 0;

    component.deleteRecording(0);

    expect(component.recordings).toEqual([]);
    expect(component.testAudio.pause).toHaveBeenCalled();
    expect(component.testAudio.removeAttribute).toHaveBeenCalledWith('src');
    expect(component.testAudio.load).toHaveBeenCalled();
    expect(component.playingRecordingIndex).toBeNull();
    expect(revokeObjectURL).toHaveBeenCalledWith(recording.url);
  });

  it('uploads only the remaining saved prompt blobs', () => {
    const first = {blob: new Blob(['prompt one']), url: 'blob:prompt-one'};
    const second = {blob: new Blob(['prompt two']), url: 'blob:prompt-two'};
    component.recordings = [first, second];
    component.deleteRecording(0);

    component.sendRecording();

    expect(taskCommentService.addComment).toHaveBeenCalledWith(
      component.task,
      undefined,
      'discussion',
      undefined,
      [second.blob],
    );
    expect(component.isSending).toBe(false);
    expect(component.recordingAvailable).toBe(false);
  });
});
