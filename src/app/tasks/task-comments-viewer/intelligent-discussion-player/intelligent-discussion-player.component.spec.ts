import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {DiscussionComment, Task, TaskCommentService} from 'src/app/api/models/doubtfire-model';
import {AudioPlayerComponent} from 'src/app/common/audio-player/audio-player.component';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {AlertService} from 'src/app/common/services/alert.service';
import {IntelligentDiscussionPlayerComponent} from './intelligent-discussion-player.component';

describe('IntelligentDiscussionPlayerComponent', () => {
  let component: IntelligentDiscussionPlayerComponent;
  let fixture: ComponentFixture<IntelligentDiscussionPlayerComponent>;
  let fileDownloader: {downloadBlob: ReturnType<typeof vi.fn>};
  let audioPlayer: {
    setSrc: ReturnType<typeof vi.fn>;
    play: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    fileDownloader = {
      downloadBlob: vi.fn((url: string, onSuccess: (blobUrl: string) => void) => {
        onSuccess(`blob:${url}`);
      }),
    };
    audioPlayer = {
      setSrc: vi.fn(),
      play: vi.fn(),
      stop: vi.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [IntelligentDiscussionPlayerComponent],
      providers: [
        {provide: MatDialog, useValue: {open: vi.fn()}},
        {provide: TaskCommentService, useValue: {}},
        {provide: FileDownloaderService, useValue: fileDownloader},
        {provide: AlertService, useValue: {error: vi.fn()}},
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(IntelligentDiscussionPlayerComponent, {set: {template: ''}})
      .compileComponents();

    fixture = TestBed.createComponent(IntelligentDiscussionPlayerComponent);
    component = fixture.componentInstance;
    component.discussion = {
      id: 69,
      numberOfPrompts: 2,
      status: 'complete',
      responseUrl: '/discussion/response',
      generateDiscussionPromptUrl: (promptNumber: number) => `/discussion/prompt/${promptNumber}`,
    } as unknown as DiscussionComment;
    component.task = {unit: {currentUserIsStaff: true}} as Task;
    component.audioPlayer = audioPlayer as unknown as AudioPlayerComponent;
  });

  it('downloads and plays a selected prompt', () => {
    component.togglePromptTrack(1);

    expect(fileDownloader.downloadBlob).toHaveBeenCalledWith(
      '/discussion/prompt/1',
      expect.any(Function),
      expect.any(Function),
    );
    expect(audioPlayer.setSrc).toHaveBeenCalledWith('blob:/discussion/prompt/1');
    expect(audioPlayer.play).toHaveBeenCalled();
    expect(component.selectedTrackLabel).toEqual('Prompt 2');
    expect(component.selectedTrackKey).toEqual('prompt-1');
  });

  it('stops the current prompt instead of downloading it again', () => {
    component.selectedTrackKey = 'prompt-1';
    component.audioPlaying = true;

    component.togglePromptTrack(1);

    expect(audioPlayer.stop).toHaveBeenCalled();
    expect(fileDownloader.downloadBlob).not.toHaveBeenCalled();
  });

  it('only downloads and plays the response when requested', () => {
    expect(fileDownloader.downloadBlob).not.toHaveBeenCalled();

    component.toggleResponseTrack();

    expect(fileDownloader.downloadBlob).toHaveBeenCalledWith(
      '/discussion/response',
      expect.any(Function),
      expect.any(Function),
    );
    expect(audioPlayer.setSrc).toHaveBeenCalledWith('blob:/discussion/response');
    expect(audioPlayer.play).toHaveBeenCalled();
    expect(component.selectedTrackLabel).toEqual('Response');
    expect(component.selectedTrackKey).toEqual('response');
  });
});
