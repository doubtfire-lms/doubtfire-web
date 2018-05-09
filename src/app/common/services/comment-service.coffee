angular.module("doubtfire.common.services.comments", [])
#
# Services for transferring comment resources
#
.factory("CommentResourceService", ->

  CommentResourceService = {}

  commentImageUrl = ""
  commentAudioUrl = ""
  commentType = ""
  task = ""

  CommentResourceService.setImageUrl = (imageURL) ->
    if (imageURL?)
      CommentResourceService.commentImageUrl = imageURL

  CommentResourceService.setAudioUrl = (audioURL) ->
    if(audioURL?)
      CommentResourceService.commentAudioUrl = audioURL

  CommentResourceService.setCommentType = (commentType) ->
    if (commentType?)
      CommentResourceService.commentType = commentType

  CommentResourceService.setTask = (task) ->
    if (task?)
      CommentResourceService.task = task
    
  CommentResourceService
)