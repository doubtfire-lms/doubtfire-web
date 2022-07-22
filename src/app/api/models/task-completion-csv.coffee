angular.module("doubtfire.api.models.task-completion-csv", [])

.service("TaskCompletionCsv", (DoubtfireConstants, $window, fileDownloaderService) ->
  this.downloadFile = (unit) ->
    fileDownloaderService.downloadFile "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/task_completion.json", "#{unit.name}-task-completion.csv"

  return this
)

.service("TutorAssessmentCsv", (DoubtfireConstants, $window) ->
  this.downloadFile = (unit) ->
    fileDownloaderService.downloadFile "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/tutor_assessments.json", "#{unit.name}-tutor-assessments.csv"

  return this
)
