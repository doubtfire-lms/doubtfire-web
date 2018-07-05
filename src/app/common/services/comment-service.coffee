angular.module("doubtfire.common.services.comments", [])
#
# Services for transferring comment resources
#
.factory("CommentResourceService", ->

  CommentResourceService = {}

  commentImageUrl = ""
  commentType = ""
  task = ""
  audioContext = ""

  CommentResourceService.setImageUrl = (imageURL) ->
    if (imageURL?)
      CommentResourceService.commentImageUrl = imageURL

  CommentResourceService.setCommentType = (commentType) ->
    if (commentType?)
      CommentResourceService.commentType = commentType

  CommentResourceService.setTask = (task) ->
    if (task?)
      CommentResourceService.task = task

  CommentResourceService
)