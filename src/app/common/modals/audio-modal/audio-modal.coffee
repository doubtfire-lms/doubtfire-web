angular.module("doubtfire.common.modals.audio-modal", [])

#
# Modal to contain an image used in user comments.
#
.factory("AudioModal", ($modal) ->
  AudioModal = {}

  AudioModal.show = ->
    $modal.open
      templateUrl: 'common/modals/audio-modal/audio-modal.tpl.html'
      controller: 'AudioModalCtrl'
      size: 'md'

  AudioModal
)

.controller("AudioModalCtrl", ($scope, $modalInstance, CommentResourceService, $sce, $http, $q) ->

  $scope.commentAudioUrl = CommentResourceService.commentAudioUrl

  $http({url: $scope.commentAudioUrl, method: "get", withCredentials: true, params: ""}, responseType: "text").then (response) ->
    $scope.audioBlob = $sce.trustAsResourceUrl(response.data)

  $scope.close = ->
    $modalInstance.dismiss()

)