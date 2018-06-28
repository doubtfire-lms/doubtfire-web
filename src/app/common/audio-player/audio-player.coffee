angular.module('doubtfire.common.audio-player', [])

.directive 'audioPlayer', ->
  restrict: 'E'
  replace: true
  templateUrl: 'common/audio-player/audio-player.tpl.html'

  controller: ($scope, Task, $sce, $http, $q) ->

    $scope.isLoaded = false

    angular.element(document).ready( ->
      index = $scope.$parent.$index
      audioElement = document.getElementById('audio-element-' + index)

      audioElement.addEventListener("play", (e) ->
        if not $scope.isLoaded
          getAudioComment($scope.$parent.comment, audioElement)
      )
    )

    getAudioComment = (comment, audioElement) ->
      audioUrl = $sce.trustAsResourceUrl(Task.generateCommentsAttachmentUrl($scope.project, $scope.task, comment))
      $http({url: audioUrl, method: "get", withCredentials: true, params: ""}, responseType: "text").then (response) ->
        audioElement.src = $sce.trustAsResourceUrl(response.data)
        $scope.isLoaded = true
        return

