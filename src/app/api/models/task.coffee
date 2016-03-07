angular.module("doubtfire.api.models.task", [])

.factory("Task", (resourcePlus, api, currentUser) ->
  Task = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id", { project_id: "@project_id", task_definition_id: "@task_definition_id" }

  Task.summaryData = resourcePlus "/tasks/:id", { id: "@id" }

  #
  # Generates a url for the given task
  #
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
