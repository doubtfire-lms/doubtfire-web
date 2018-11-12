angular.module("doubtfire.common.services.comments", [])
#
# Services for transferring comment resources
#
.factory("CommentResourceService", ->

  CommentResourceService = {}

  commentResourceUrl = ""
  commentType = ""
  task = ""
  audioContext = ""

  CommentResourceService.setResourceUrl = (resourceURL) ->
    if (resourceURL?)
      CommentResourceService.commentResourceUrl = resourceURL

  CommentResourceService.setCommentType = (commentType) ->
    if (commentType?)
      CommentResourceService.commentType = commentType

  CommentResourceService.setTask = (task) ->
    if (task?)
      CommentResourceService.task = task

  CommentResourceService
)