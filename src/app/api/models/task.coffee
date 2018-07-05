angular.module("doubtfire.api.models.task", [])

.factory("Task", (resourcePlus, api, currentUser, $http) ->
  Task = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id", { project_id: "@project_id", task_definition_id: "@task_definition_id" }

  Task.SubmissionDetails = resourcePlus "/projects/:id/task_def_id/:task_definition_id/submission_details"

  Task.summaryData = resourcePlus "/tasks/:id", { id: "@id" }

  Task.applyForExtension = (task, onSuccess, onError) ->
    $http.post("#{api}/projects/#{task.project().project_id}/task_def_id/#{task.task_definition_id}/extension", { }).then(
      (data) -> onSuccess(data)
      (response) -> onError(response)
    )

  #
  # Generates a url for the given task
  #
  Task.generateCommentsUrl = (task) ->
    "#{api}/projects/#{task.project().project_id}/task_def_id/#{task.task_definition_id}/comments?auth_token=#{currentUser.authenticationToken}"

  Task.generateCommentsAttachmentUrl = (project, task, comment) ->
    "#{api}/projects/#{project.project_id}/task_def_id/#{task.task_definition_id}/comments/#{comment.id}?as_attachment=false&auth_token=#{currentUser.authenticationToken}"

  Task.generateSubmissionUrl = (project, task) ->
    "#{api}/projects/#{project.project_id}/task_def_id/#{task.definition.id}/submission?auth_token=#{currentUser.authenticationToken}"

  Task.getTaskPDFUrl = (unit, task_def) ->
    "#{api}/units/#{unit.id}/task_definitions/#{task_def.id}/task_pdf.json?auth_token=#{currentUser.authenticationToken}"

  Task.getTaskResourcesUrl = (unit, task_def) ->
    "#{api}/units/#{unit.id}/task_definitions/#{task_def.id}/task_resources.json?auth_token=#{currentUser.authenticationToken}"

  Task.getTaskDefinitionBatchUploadUrl = (unit) ->
    "#{api}/csv/task_definitions?auth_token=#{currentUser.authenticationToken}&unit_id=#{unit.id}"

  Task.getTaskMarkingUrl = (unit) ->
    "#{api}/submission/assess.json?unit_id=#{unit.id}&auth_token=#{currentUser.authenticationToken}"

  Task.generateMarkingSubmissionUrl = ->

  Task
)
