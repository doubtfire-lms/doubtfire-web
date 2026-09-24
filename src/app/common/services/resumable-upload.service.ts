import {HttpClient, HttpEventType, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, filter, firstValueFrom, lastValueFrom, map, tap} from 'rxjs';

export type UploadEvent = {type: 'progress'; progress: number} | {type: 'response'; body: unknown};

interface UploadStatus {
  id: string;
  offset: number;
  size: number;
  chunk_size: number;
  chunks: {size: number; sha256: string}[];
}

/**
 * Uploads a file in chunks, so no single request outlasts a proxy's timeout. Failed chunks are
 * retried from wherever the server got to, and choosing the same file again resumes the upload
 * once the chunks already received match it.
 */
@Injectable({
  providedIn: 'root',
})
export class ResumableUploadService {
  private static readonly MAX_ATTEMPTS = 5;

  constructor(private http: HttpClient) {}

  /**
   * Upload file to the uploads endpoint at baseUrl, passing params when starting the upload.
   * Emits progress as a percentage, then the body of the completion response.
   */
  public upload(
    baseUrl: string,
    file: File,
    params: Record<string, string | number>,
  ): Observable<UploadEvent> {
    return new Observable<UploadEvent>((subscriber) => {
      let cancelled = false;

      this.run(
        baseUrl,
        file,
        params,
        (event) => subscriber.next(event),
        () => cancelled,
      ).then(
        () => subscriber.complete(),
        (error) => subscriber.error(error),
      );

      return () => (cancelled = true);
    });
  }

  private async run(
    baseUrl: string,
    file: File,
    params: Record<string, string | number>,
    emit: (event: UploadEvent) => void,
    isCancelled: () => boolean,
  ): Promise<void> {
    const resumeKey = `resumable-upload:${baseUrl}:${JSON.stringify(params)}:${file.name}:${file.size}:${file.lastModified}`;

    let status = await this.resume(baseUrl, resumeKey, file);
    if (!status) {
      status = await firstValueFrom(
        this.http.post<UploadStatus>(baseUrl, {...params, filename: file.name, size: file.size}),
      );
      this.storeResumeId(resumeKey, status.id);
    }

    const url = `${baseUrl}/${status.id}`;
    const progress = (loaded: number) =>
      emit({type: 'progress', progress: Math.floor((loaded / file.size) * 100)});

    let failures = 0;
    while (status.offset < file.size) {
      if (isCancelled()) {
        return;
      }

      const start = status.offset;
      const chunk = file.slice(start, Math.min(start + status.chunk_size, file.size));
      try {
        status = await this.sendChunk(url, start, chunk, (loaded) => progress(start + loaded));
        failures = 0;
      } catch (error) {
        if (++failures >= ResumableUploadService.MAX_ATTEMPTS) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** failures));
        // The chunk may have partly or fully arrived, so continue from wherever the server got to.
        status = await firstValueFrom(this.http.get<UploadStatus>(url)).catch(() => status);
      }
      progress(status.offset);
    }

    const body = await firstValueFrom(this.http.post(`${url}/complete`, {}));
    this.storeResumeId(resumeKey, null);
    emit({type: 'response', body});
  }

  private async resume(baseUrl: string, resumeKey: string, file: File): Promise<UploadStatus> {
    const id = this.readResumeId(resumeKey);
    if (!id) {
      return null;
    }

    let status: UploadStatus;
    try {
      status = await firstValueFrom(this.http.get<UploadStatus>(`${baseUrl}/${id}`));
    } catch {
      // The upload expired or was completed elsewhere, so start a new one.
      this.storeResumeId(resumeKey, null);
      return null;
    }

    if (status.size === file.size && (await this.matchesReceivedChunks(file, status))) {
      return status;
    }

    // A different file with the same name, size and date, so start again.
    this.storeResumeId(resumeKey, null);
    this.http.delete(`${baseUrl}/${id}`).subscribe({error: () => {}});
    return null;
  }

  private async matchesReceivedChunks(file: File, status: UploadStatus): Promise<boolean> {
    let start = 0;
    for (const chunk of status.chunks) {
      if ((await this.sha256(file.slice(start, start + chunk.size))) !== chunk.sha256) {
        return false;
      }
      start += chunk.size;
    }
    return true;
  }

  private async sha256(blob: Blob): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
      '',
    );
  }

  private async sendChunk(
    url: string,
    offset: number,
    chunk: Blob,
    onProgress: (loaded: number) => void,
  ): Promise<UploadStatus> {
    const form = new FormData();
    form.append('offset', `${offset}`);
    form.append('sha256', await this.sha256(chunk));
    form.append('chunk', chunk, 'chunk');

    return lastValueFrom(
      this.http
        .request<UploadStatus>('PATCH', url, {body: form, observe: 'events', reportProgress: true})
        .pipe(
          tap((event) => {
            if (event.type === HttpEventType.UploadProgress) {
              onProgress(event.loaded);
            }
          }),
          filter((event) => event instanceof HttpResponse),
          map((event: HttpResponse<UploadStatus>) => event.body),
        ),
    );
  }

  private readResumeId(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private storeResumeId(key: string, id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(key, id);
      } else {
        localStorage.removeItem(key);
      }
    } catch {
      // Without storage the upload still works, it just can't resume after a reload.
    }
  }
}
