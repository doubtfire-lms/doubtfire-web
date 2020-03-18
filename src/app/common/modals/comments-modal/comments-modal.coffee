angular.module("doubtfire.common.modals.comments-modal", [])
#
# Modal to contain an image used in user comments.
#
.factory("CommentsModal", ($modal) ->
  CommentsModal = {}
  CommentsModal.show = (commentResourceUrl, commentType) ->
    $modal.open
      templateUrl: 'common/modals/comments-modal/comments-modal.tpl.html'
      controller: 'CommentsModalCtrl'
      size: 'lg'
      resolve:
        commentResourceUrl: -> commentResourceUrl
        commentType: -> commentType
  CommentsModal
)
.controller("CommentsModalCtrl", ($scope, $modalInstance, commentResourceUrl, commentType) ->
  $scope.commentResourceUrl = commentResourceUrl
  $scope.commentType = commentType
  $scope.close = ->
    $modalInstance.dismiss()
)
