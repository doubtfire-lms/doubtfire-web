import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {ResumableUploadService, UploadEvent} from './resumable-upload.service';

const BASE_URL = '/api/submission/batch_feedback_uploads';
const UPLOAD_URL = `${BASE_URL}/abc`;
const PARAMS = {unit_id: 1, task_definition_id: 2};

const sha256 = async (text: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

describe('ResumableUploadService', () => {
  let service: ResumableUploadService;
  let http: HttpTestingController;
  let file: File;

  // Wait for the service's next request, which may follow hashing as well as timers.
  const nextRequest = (url: string, method: string) =>
    vi.waitFor(() => http.expectOne((r) => r.url === url && r.method === method));

  const startUpload = (upload = file) => {
    const events: UploadEvent[] = [];
    let error: unknown;
    service.upload(BASE_URL, upload, PARAMS).subscribe({
      next: (event) => events.push(event),
      error: (e) => (error = e),
    });
    return {events, error: () => error};
  };

  const expectChunk = async (offset: number, data: string) => {
    const request = await nextRequest(UPLOAD_URL, 'PATCH');
    const body = request.request.body as FormData;
    expect(body.get('offset')).toBe(`${offset}`);
    expect((body.get('chunk') as Blob).size).toBe(data.length);
    expect(body.get('sha256')).toBe(await sha256(data));
    return request;
  };

  const status = async (offset: number) => {
    const chunks = [];
    for (let start = 0; start < offset; start += 4) {
      const data = 'abcdefghij'.slice(start, Math.min(start + 4, offset));
      chunks.push({size: data.length, sha256: await sha256(data)});
    }
    return {id: 'abc', offset, size: 10, chunk_size: 4, chunks};
  };

  const finish = async () => {
    (await nextRequest(`${UPLOAD_URL}/complete`, 'POST')).flush({id: 'job-1'});
  };

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    service = TestBed.inject(ResumableUploadService);
    http = TestBed.inject(HttpTestingController);
    file = new File(['abcdefghij'], 'feedback.zip', {lastModified: 1});
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('uploads the file in hashed chunks then completes it', async () => {
    const upload = startUpload();

    const create = await nextRequest(BASE_URL, 'POST');
    expect(create.request.body).toEqual({...PARAMS, filename: 'feedback.zip', size: 10});
    create.flush(await status(0));

    (await expectChunk(0, 'abcd')).flush(await status(4));
    (await expectChunk(4, 'efgh')).flush(await status(8));
    (await expectChunk(8, 'ij')).flush(await status(10));
    await finish();

    await vi.waitFor(() =>
      expect(upload.events.at(-1)).toEqual({type: 'response', body: {id: 'job-1'}}),
    );
    expect(upload.events).toContainEqual({type: 'progress', progress: 80});
    expect(localStorage.length).toBe(0);
  });

  it('continues from the server offset after a failed chunk', async () => {
    startUpload();
    (await nextRequest(BASE_URL, 'POST')).flush(await status(0));

    (await expectChunk(0, 'abcd')).error(new ProgressEvent('error'));
    await vi.advanceTimersByTimeAsync(2000);

    // The failed chunk had arrived, so the next one starts after it.
    (await nextRequest(UPLOAD_URL, 'GET')).flush(await status(4));
    (await expectChunk(4, 'efgh')).flush(await status(8));
    (await expectChunk(8, 'ij')).flush(await status(10));
    await finish();
  });

  it('resumes an unfinished upload of the same file', async () => {
    startUpload();
    (await nextRequest(BASE_URL, 'POST')).flush(await status(0));
    (await expectChunk(0, 'abcd')).flush(await status(4));
    // Abandon the first upload's in-flight chunk, as if the page had been reloaded.
    await nextRequest(UPLOAD_URL, 'PATCH');

    startUpload();
    (await nextRequest(UPLOAD_URL, 'GET')).flush(await status(8));

    (await expectChunk(8, 'ij')).flush(await status(10));
    await finish();
  });

  it('starts again when the file no longer matches the received chunks', async () => {
    startUpload();
    (await nextRequest(BASE_URL, 'POST')).flush(await status(0));
    (await expectChunk(0, 'abcd')).flush(await status(4));
    await nextRequest(UPLOAD_URL, 'PATCH');

    // Same name, size and date, but different contents.
    startUpload(new File(['XXXXefghij'], 'feedback.zip', {lastModified: 1}));
    (await nextRequest(UPLOAD_URL, 'GET')).flush(await status(4));

    (await nextRequest(UPLOAD_URL, 'DELETE')).flush(null);
    const create = await nextRequest(BASE_URL, 'POST');
    expect(create.request.body).toEqual({...PARAMS, filename: 'feedback.zip', size: 10});
  });

  it('fails after repeated errors', async () => {
    const upload = startUpload();
    (await nextRequest(BASE_URL, 'POST')).flush(await status(0));

    for (let attempt = 1; attempt < 5; attempt++) {
      (await expectChunk(0, 'abcd')).error(new ProgressEvent('error'));
      await vi.advanceTimersByTimeAsync(1000 * 2 ** attempt);
      (await nextRequest(UPLOAD_URL, 'GET')).flush(await status(0));
    }
    (await expectChunk(0, 'abcd')).error(new ProgressEvent('error'));

    await vi.waitFor(() => expect(upload.error()).toBeTruthy());
  });
});
