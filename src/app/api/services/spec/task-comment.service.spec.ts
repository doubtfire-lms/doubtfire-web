import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  HttpRequest,
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {TaskComment} from 'src/app/api/models/doubtfire-model';
import {FileDownloaderService} from 'src/app/common/file-downloader/file-downloader.service';
import {EmojiService} from 'src/app/common/services/emoji.service';
import {TaskCommentService} from '../task-comment.service';
import {TestAttemptService} from '../test-attempt.service';
import {UserService} from '../user.service';

describe('TaskCommentService discussion comments', () => {
  let taskCommentService: TaskCommentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskCommentService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: EmojiService, useValue: {}},
        {provide: UserService, useValue: {cache: {getOrCreate: () => ({})}}},
        {provide: FileDownloaderService, useValue: {}},
        {provide: TestAttemptService, useValue: {cache: {getOrCreate: () => ({})}}},
      ],
    });

    taskCommentService = TestBed.inject(TaskCommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts a discussion reply without expecting an entity response', () => {
    const replyAudio = new Blob(['reply audio'], {type: 'audio/webm'});
    const comment = {
      id: 69,
      project: {id: 1},
      task: {definition: {id: 2}},
    } as TaskComment;
    let completed = false;

    taskCommentService.postDiscussionReply(comment, replyAudio).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne((request: HttpRequest<FormData>): boolean => {
      expect(request.url).toEqual(
        'http://localhost:3000/api/projects/1/task_def_id/2/comments/69/discussion_comment/reply',
      );
      expect(request.method).toBe('POST');
      expect(request.body instanceof FormData).toBe(true);
      const attachment = request.body.get('attachment') as Blob;
      expect(attachment instanceof Blob).toBe(true);
      expect(attachment.size).toBe(replyAudio.size);
      expect(attachment.type).toBe(replyAudio.type);
      return true;
    });

    req.flush(null);

    expect(completed).toBe(true);
  });
});
