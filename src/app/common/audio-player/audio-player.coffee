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

    # Remove until endpoint returns file lenfth
    # $scope.duration = ""

    angular.element(document).ready( ->
      index = $scope.$parent.$index
      audio = document.getElementById('audio-element-' + index)
      playBtn = document.getElementById('playButton-' + index)
      progressbar = document.getElementById('seekObj' + index)

      audio.ontimeupdate = ->
        $scope.$apply( () ->
          $scope.audioProgress = if isNaN(audio.currentTime / audio.duration) then 0 else (audio.currentTime / audio.duration)
        )
        return

      audio.loadedmetadata = ->
        console.info("Can play through now so wil play")
        audio.play()
        return

      audio.onended = ->
        $scope.$apply( () ->
          $scope.isPlaying = false
        )
        return

      playBtn.onclick = ->
        if not $scope.isLoaded
          getAudioComment($scope.$parent.comment, audio)
        if audio.paused
          audio.play()
          $scope.$apply( () ->
            $scope.isPlaying = true
          )
        else
          audio.pause()
          audio.currentTime = 0
          $scope.$apply( () ->
            $scope.isPlaying = false
          )
        return
    )

    getAudioComment = (comment, audio) ->
      audioUrl = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))
      $http({url: audioUrl, method: "get", withCredentials: true, params: ""}, responseType: "text").then (response) ->
        audio.src = $sce.trustAsResourceUrl(response.data)
        $scope.isLoaded = true
        return

