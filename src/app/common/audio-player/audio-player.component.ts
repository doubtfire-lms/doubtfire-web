import { Component, Inject, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Task } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {
  @Input() project: {};
  @Input() task: {};
  @Input() comment: {};
  @Input() audioSrc: { src: string };

  @ViewChild('progressBar', { read: ElementRef }) private progressBar: ElementRef;

  barWidth: number;
  isLoaded = false;
  isPlaying = false;
  audioProgress = 0;
  currentTime = 0;
  audio: HTMLAudioElement = document.createElement('AUDIO') as HTMLAudioElement;

  constructor(@Inject(Task) private TaskModel) {
    this.audio.ontimeupdate = () => {
      const percentagePlayed = this.audio.currentTime / this.audio.duration;
      this.audioProgress = (isNaN(percentagePlayed) ? 0 : percentagePlayed) * 100;
    };

    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }

  ngOnInit() {}

  setTime(percent: number) {
    const newTime = percent * this.audio.duration;
    this.audio.currentTime = newTime;
  }

  seek(evt: MouseEvent) {
    const offset = evt.offsetX;
    const percent = offset / this.progressBar.nativeElement.offsetWidth;

    if (!this.isLoaded) {
      this.loadAudio();
      this.audio.onloadeddata = () => {
        this.setTime(percent);
      };
    } else {
      this.setTime(percent);
    }
  }

  public setSrc(src: string) {
    this.audio.src = src;
    this.audio.load();
    this.audio.onloadeddata = () => {
      this.setTime(0);
    };
    this.audioProgress = 0;
  }

  loadAudio() {
    this.isLoaded = true;
    if (this.project && this.task && this.comment) {
      this.audio.src = this.TaskModel.generateCommentsAttachmentUrl(this.project, this.task, this.comment);
    } else if (this.audioSrc) {
      this.audio.src = this.audioSrc.src;
    }
  }

  pausePlay() {
    if (!this.isLoaded) {
      this.loadAudio();
    }
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying = true;
    } else {
      this.audio.pause();
      this.isPlaying = false;
    }
  }
}
