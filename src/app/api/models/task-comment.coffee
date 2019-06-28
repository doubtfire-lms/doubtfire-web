angular.module("doubtfire.api.models.task-comment", [])
.factory("TaskComment", (resourcePlus) ->
  resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/comments/:id", { id: "@id", project_id: "@project_id", task_definition_id: "@task_definition_id" }, {
    create_media: {
      method: "POST",
      headers: { 'Content-Type': undefined }
    }
  }
)

angular.module("doubtfire.api.models.discussion-comment", [])
.factory("DiscussionComment", (resourcePlus) ->
  createResource = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/discussion_comments", { project_id: "@project_id", task_definition_id: "@task_definition_id" }, {
    create_media: {
      method: "POST",
      headers: { 'Content-Type': undefined }
    }
  }
  getResource = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/comments/:task_comment_id/discussion_comment", { project_id: "@project_id", task_definition_id: "@task_definition_id", task_comment_id: "@task_comment_id" }
  result =
    post: (project_id, task_definition_id) ->
      createResource.create_media(project_id, task_definition_id)
    get: (project_id, task_definition_id, task_comment_id) ->
      getResource.get(project_id, task_definition_id, task_comment_id)

)

# angular.module("doubtfire.api.models.discussion-comment", [])
# .factory("DiscussionComment", (resourcePlus) ->

# )



# .factory("TaskSimilarity", ($http, DoubtfireConstants, currentUser) ->
#   result =
#     similarityUrl: (task, match) ->
#       "#{DoubtfireConstants.API_URL}/tasks/#{task.id}/similarity/#{match}"

#     get: (task, match, callback) ->
#       url = result.similarityUrl(task, match)
#       $http.get(url).success ( data ) ->
#         callback(data)

#     put: (task, match, other, value, callback, error_callback) ->
#       url = result.similarityUrl(task, match)
#       $http.put(url, { dismissed: value, other: other}).then(
#         (data) -> callback(data)
#         (response) -> error_callback(response))
# )