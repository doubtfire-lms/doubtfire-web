angular.module("doubtfire.api.models.task", [])

.factory("Task", (resourcePlus, DoubtfireConstants, $http) ->
  Task = resourcePlus "/projects/:project_id/task_def_id/:task_definition_id", { project_id: "@project_id", task_definition_id: "@task_definition_id" }

  # Task.SubmissionDetails = resourcePlus "/projects/:id/task_def_id/:task_definition_id/submission_details"

  Task.summaryData = resourcePlus "/tasks/:id", { id: "@id" }

  Task.applyForExtension = (task, reason, weeksRequested, onSuccess, onError) ->
    $http.post("#{DoubtfireConstants.API_URL}/projects/#{task.project.id}/task_def_id/#{task.definition.id}/request_extension", { comment: reason, weeks_requested: weeksRequested }).then(
      (data) -> onSuccess(data)
      (response) -> onError(response)
    )

  Task.assessExtension = (task, taskCommentID, assessment, onSuccess, onError) ->
    $http.put("#{DoubtfireConstants.API_URL}/projects/#{task.project.id}/task_def_id/#{task.definition.id}/assess_extension/#{taskCommentID}", { granted: assessment }).then(
      (data) -> onSuccess(data)
      (response) -> onError(response)
    )

  #
  # Generates a url for the given task
  #
  Task.generateCommentsAttachmentUrl = (project, task, comment) ->
    "#{DoubtfireConstants.API_URL}/projects/#{project.id}/task_def_id/#{task.definition.id}/comments/#{comment.id}?as_attachment=false"

  Task.generateDiscussionPromptUrl = (task, commentID, number) ->
    "#{DoubtfireConstants.API_URL}/projects/#{task.project.id}/task_def_id/#{task.definition.id}/comments/#{commentID}/discussion_comment/prompt_number/#{number}?as_attachment=false"

  Task.generateDiscussionResponseUrl = (task, commentID) ->
    "#{DoubtfireConstants.API_URL}/projects/#{task.project.id}/task_def_id/#{task.definition.id}/comments/#{commentID}/discussion_comment/response?as_attachment=false"

  # Task.generateSubmissionUrl = (project, task) ->
  #   "#{DoubtfireConstants.API_URL}/projects/#{project.project_id}/task_def_id/#{task.definition.id}/submission"

  # Task.generateTestSubmissionUrl = (unitId, task_def) ->
  #   "#{DoubtfireConstants.API_URL}/units/#{unitId}/task_definitions/#{task_def.id}/test_overseer_assessment"

  # Task.getTaskPDFUrl = (unit, task_def) ->
  #   "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/#{task_def.id}/task_pdf.json"

  # Task.getTaskResourcesUrl = (unit, task_def) ->
  #   "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/#{task_def.id}/task_resources.json"

  Task.getTaskDefinitionBatchUploadUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/csv/task_definitions?unit_id=#{unit.id}"

  Task.getTaskMarkingUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/submission/assess.json?unit_id=#{unit.id}"

  Task.getTaskAssessmentResourcesUrl = (unit, task_def) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/task_definitions/#{task_def.id}/task_assessment_resources.json"

  # Task.generateLatestAssessmentUrl = (task) ->
  #   "#{DoubtfireConstants.API_URL}/projects/#{task.project.id}/task_def_id/#{task.definition.id}/submissions/latest"

  # Task.getSubmissionByTimestampUrl = (task, timestamp) ->
  #   "#{DoubtfireConstants.API_URL}/projects/#{task.project.id}/task_def_id/#{task.definition.id}/submissions/timestamps/#{timestamp}"

  Task.generateMarkingSubmissionUrl = ->

  Task
)
