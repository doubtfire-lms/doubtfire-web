// angular.module('doubtfire.common.audio-player', [])

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

// .directive 'audioPlayer', ->
//   restrict: 'E'
//   replace: true
//   templateUrl: 'common/audio-player/audio-player.tpl.html'

//   controller: ($scope, Task, $sce, $http, $q) ->
//     $scope.isLoaded = false
//     $scope.isPlaying = false
//     $scope.audioProgress = 0
//     $scope.max = 1
//     $scope.currentTime = 0
//     audio = document.createElement("AUDIO")

//     $scope.playAudio = () ->
//       if not $scope.isLoaded
//         $scope.isLoaded = true
//         audio.src = Task.generateCommentsAttachmentUrl($scope.project, $scope.task, $scope.$parent.comment)
//       if audio.paused
//         audio.play()
//         $scope.isPlaying = true
//       else
//         audio.pause()
//         audio.currentTime = 0
//         $scope.isPlaying = false
//       return

//     audio.ontimeupdate = ->
//       percentagePlayed = audio.currentTime / audio.duration
//       $scope.audioProgress = if isNaN(percentagePlayed) then 0 else percentagePlayed
//       $scope.$apply()
//       return

//     audio.onended = ->
//       $scope.isPlaying = false
//       $scope.$apply()
//       return
