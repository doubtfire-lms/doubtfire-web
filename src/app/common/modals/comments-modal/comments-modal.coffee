angular.module("doubtfire.common.modals.comments-modal", [])
#
# Modal to contain an image used in user comments.
#
.factory("CommentsModal", ($modal) ->
  CommentsModal = {}
  CommentsModal.show = ->
    $modal.open
      templateUrl: 'common/modals/comments-modal/comments-modal.tpl.html'
      controller: 'CommentsModalCtrl'
      size: 'lg'
  CommentsModal
)
.controller("CommentsModalCtrl", ($scope, $modalInstance, CommentResourceService) ->
  $scope.commentResourceUrl = CommentResourceService.commentResourceUrl
  $scope.commentType = CommentResourceService.commentType
  $scope.close = ->
    $modalInstance.dismiss()
)