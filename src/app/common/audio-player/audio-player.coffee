angular.module('doubtfire.common.audio-player', [])

.directive 'audioPlayer', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-player/audio-player.tpl.html'

  controller: ($scope, CommentResourceService, mediaService, Task, $sce, $http, $q) ->

    $scope.isLoaded = false

    angular.element(document).ready( ->
      index = $scope.$parent.$index
      btnPlay = document.getElementById('btnPlay-' + index)
      audioElement = document.getElementById('audio-element-' + index)
      canvasElement = document.getElementById('audio-player-visualiser-' + index)

      btnPlay.onclick = ->
        if not $scope.isLoaded
          audioPlayerSetup($scope.$parent.comment, audioElement, canvasElement)
        $scope.mediaObject.playAudio()
    )

    audioPlayerSetup = (comment, audioElement, canvasElement)->
      console.info("Setting up player")
      getAudioComment(comment, audioElement)
      $scope.mediaObject = mediaService.createContext(audioElement, canvasElement)
      $scope.isLoaded = true

    getAudioComment = (comment, audioElement) ->
      audioUrl = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))

      $http({url: audioUrl, method: "get", withCredentials: true, params: ""}, responseType: "text").then (response) ->
        audioElement.src = $sce.trustAsResourceUrl(response.data)

