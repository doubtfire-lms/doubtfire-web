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
        getAudioComment($scope.$parent.comment)
      else
        if audio.paused
          audio.play()
          $scope.isPlaying = true
        else
          audio.pause()
          audio.currentTime = 0
          $scope.isPlaying = false
        return

    audio.ontimeupdate = ->
      val = audio.currentTime / audio.duration

      # minutes = audio.currentTime.toString().split('.')[0]
      # seconds = audio.currentTime.toString().split('.')[1].substr('0','1')
      # $scope.currentTime = seconds

      $scope.audioProgress = if isNaN(val) then 0 else val
      $scope.$apply()
      return

    audio.onended = ->
      $scope.isPlaying = false
      $scope.$apply()
      return


    getAudioComment = (comment) ->
      Task.downloadCommentAttachment($scope.project, $scope.task, comment,
        (successResponse) ->
          audio.src = successResponse.data
          audio.play()
          $scope.isPlaying = true
        (errorResponse) ->
          console.log(errorResponse)
      )
      return
