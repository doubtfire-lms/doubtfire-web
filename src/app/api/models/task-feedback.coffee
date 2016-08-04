mod = angular.module("doubtfire.api.models.task-feedback", [])

.factory("TaskFeedback", (api, currentUser, $window, resourcePlus) ->
  TaskFeedback = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/submission", { task_definition_id: "@task_definition_id", project_id: "@project_id" }

  TaskFeedback.getTaskUrl = (task) ->
    "#{api}/projects/#{task.project().project_id}/task_def_id/#{task.definition.id}/submission?auth_token=#{currentUser.authenticationToken}"

  TaskFeedback.getTaskFilesUrl = (task) ->
    "#{api}/projects/#{task.project().project_id}/task_def_id/#{task.definition.id}/submission_files?auth_token=#{currentUser.authenticationToken}"

  TaskFeedback.openFeedback = (task) ->
    $window.open TaskFeedback.getTaskUrl(task), "_blank"

  return TaskFeedback
)

module.exports = mod.name
