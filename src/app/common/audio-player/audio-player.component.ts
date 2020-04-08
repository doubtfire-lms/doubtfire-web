import { Component, Inject, Input, OnInit } from '@angular/core';
import { Task } from 'src/app/ajs-upgraded-providers';

@Component({
  selector: 'audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {

  @Input() project: {};
  @Input() task: {};
  @Input() comment: {};

  isLoaded = false;
  isPlaying = false;
  audioProgress = 0;
  audioBuffer = 0;
  currentTime = 0;
  audio: any = document.createElement('AUDIO');

  constructor(@Inject(Task) private Task) {
    this.audio.ontimeupdate = () => {
      let percentagePlayed = this.audio.currentTime / this.audio.duration;
      this.audioProgress = (isNaN(percentagePlayed) ? 0 : percentagePlayed) * 100;

      let bufferPercentage = this.audio.buffered.end(0) / this.audio.duration;
      this.audioBuffer = (isNaN(bufferPercentage) ? 0 : bufferPercentage) * 100;
    };


    this.audio.onended = () => {
      this.isPlaying = false;
    };

  }
  ngOnInit(): void {
    // throw new Error("Method not implemented.");
  }

  playAudio() {
    if (!this.isLoaded) {
      this.isLoaded = true;
      this.audio.src = this.Task.generateCommentsAttachmentUrl(this.project, this.task, this.comment);
    }
    if (this.audio.paused) {
      this.audio.play();
      this.isPlaying = true;
    } else {

      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
}
