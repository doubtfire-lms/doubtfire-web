angular.module('doubtfire.common.audio-player', [])

.directive 'audioPlayer', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-player/audio-player.tpl.html'

  controller: ($scope, Task, $sce, $http, $q) ->
    $scope.isLoaded = false
    $scope.isPlaying = false
    $scope.audioProgress = 0
    $scope.max = 1
    $scope.currentTime = 0
    audio = document.createElement("AUDIO")

    $scope.playAudio = () ->
      if not $scope.isLoaded
        $scope.isLoaded = true
        audio.src = Task.generateCommentsAttachmentUrl($scope.project, $scope.task, $scope.$parent.comment)
      if audio.paused
        audio.play()
        $scope.isPlaying = true
      else
        audio.pause()
        audio.currentTime = 0
        $scope.isPlaying = false
      return

    audio.ontimeupdate = ->
      percentagePlayed = audio.currentTime / audio.duration
      $scope.audioProgress = if isNaN(percentagePlayed) then 0 else percentagePlayed
      $scope.$apply()
      return

    audio.onended = ->
      $scope.isPlaying = false
      $scope.$apply()
      return
