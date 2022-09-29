import { HttpResponse } from '@angular/common/http';
import { Component, Inject, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { alertService } from 'src/app/ajs-upgraded-providers';
import { Project, Task, TaskComment } from 'src/app/api/models/doubtfire-model';
import { FileDownloaderService } from '../file-downloader/file-downloader';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnDestroy {
  @Input() project: Project;
  @Input() task: Task;
  @Input() comment: TaskComment;
  @Input() audioSrc: { src: string };

  @ViewChild('progressBar', { read: ElementRef }) private progressBar: ElementRef;

  private isLoaded = false;
  public isPlaying = false;
  public audioProgress = 0;
  public audio: HTMLAudioElement = document.createElement('AUDIO') as HTMLAudioElement;

  constructor(
    @Inject(FileDownloaderService) private fileDownloader: FileDownloaderService,
    @Inject(alertService) private alerts: any
  ) {
    this.audio.ontimeupdate = () => {
      const percentagePlayed = this.audio.currentTime / this.audio.duration;
      this.audioProgress = (isNaN(percentagePlayed) ? 0 : percentagePlayed) * 100;
    };

    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }

  ngOnDestroy(): void {
    // Clean up the blob
    if ( this.audio.src ) {
      this.fileDownloader.releaseBlob(this.audio.src);
    }
  }

  private setTime(percent: number) {
    const newTime = percent * this.audio.duration;
    this.audio.currentTime = newTime;
  }

  public seek(evt: MouseEvent) {
    const offset = evt.offsetX;
    const percent = offset / this.progressBar.nativeElement.offsetWidth;

    this.execWithAudio(true, () => {
      this.setTime(percent);
    });
  }

  public setSrc(src: string) {
    // If there was an old blob, then free the memory it uses
    if ( this.audio.src ) {
      this.fileDownloader.releaseBlob(this.audio.src);
    }
    this.audio.src = src;
    this.audio.load();
    this.audio.onloadeddata = () => {
      this.setTime(0);
    };
    this.audioProgress = 0;
  }

  private execWithAudio(onLoad: boolean, fn: () => void) {
    if (this.isLoaded) {
      fn();
    } else {
      let url: string;
      if (this.project && this.task && this.comment) {
        url = this.comment.attachmentUrl;
      } else if (this.audioSrc) {
        url = this.audioSrc.src;
      }

      this.fileDownloader.downloadBlob(
        url,
        ((blobUrl: string, response: HttpResponse<Blob>) => {
          this.isLoaded = true;
          this.setSrc(blobUrl);
          this.audio.src = blobUrl;
          this.audio.load();
          if (onload) {
            this.audio.onloadeddata = () => {
              fn();
            };
          } else {
            fn();
          }
        }).bind(this),
        ((error: any) => {
          this.alerts.add('danger', `Error loading audio. ${error}`, 6000);
        }).bind(this)
      );
    }
  }

  public pausePlay() {
    this.execWithAudio(
      true,
      (() => {
        if (this.audio.paused) {
          this.audio.play();
          this.isPlaying = true;
        } else {
          this.audio.pause();
          this.isPlaying = false;
        }
      }).bind(this)
    );
  }
}
