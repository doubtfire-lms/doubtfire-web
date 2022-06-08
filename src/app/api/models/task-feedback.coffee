angular.module("doubtfire.api.models.task-feedback", [])

.factory("TaskFeedback", (DoubtfireConstants, $window, resourcePlus) ->
  TaskFeedback = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id/submission", { task_definition_id: "@task_definition_id", project_id: "@project_id" }

  TaskFeedback.getTaskUrl = (task, asAttachment = false) ->
    url = "#{DoubtfireConstants.API_URL}/projects/#{task.project().project_id}/task_def_id/#{task.definition.id}/submission"
    url += "?as_attachment=true" if asAttachment
    url

  TaskFeedback.getTaskFilesUrl = (task) ->
    "#{DoubtfireConstants.API_URL}/projects/#{task.project().project_id}/task_def_id/#{task.definition.id}/submission_files"

  TaskFeedback.openFeedback = (task) ->
    $window.open TaskFeedback.getTaskUrl(task), "_blank"

  return TaskFeedback
)
