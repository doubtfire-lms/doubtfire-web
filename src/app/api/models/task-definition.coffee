angular.module("doubtfire.api.models.task-definition", [])

.factory("TaskDefinition", (resourcePlus, DoubtfireConstants, currentUser, fileDownloaderService) ->
  TaskDefinition = resourcePlus "/units/:unit_id/task_definitions/:id", { id: "@id", unit_id: "@unit_id" }

  TaskDefinition.taskSheet = resourcePlus "/units/:unit_id/task_definitions/:task_def_id/task_sheet", { unit_id: "@unit_id", task_def_id: "@task_def_id" }
  TaskDefinition.taskResources = resourcePlus "/units/:unit_id/task_definitions/:task_def_id/task_resources", { unit_id: "@unit_id", task_def_id: "@task_def_id" }

  TaskDefinition.downloadSubmissions = (unit, task_def) ->
    fileDownloaderService.downloadFile("#{DoubtfireConstants.API_URL}/submission/unit/#{unit.id}/task_definitions/#{task_def.id}/download_submissions", "#{unit.code}-#{task_def.abbreviation}-submissions.zip")

  TaskDefinition.downloadSubmissionsPdfs = (unit, task_def) ->
    fileDownloaderService.downloadFile("#{DoubtfireConstants.API_URL}/submission/unit/#{unit.id}/task_definitions/#{task_def.id}/student_pdfs", "#{unit.code}-#{task_def.abbreviation}-pdfs.zip")

  TaskDefinition
)
