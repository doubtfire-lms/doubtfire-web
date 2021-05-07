angular.module("doubtfire.api.models.task-completion-csv", [])

.service("TaskCompletionCsv", (DoubtfireConstants, $window, currentUser, fileDownloaderService) ->
  this.downloadFile = (unit) ->
    fileDownloaderService.downloadFile "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/task_completion.json?auth_token=#{currentUser.authenticationToken}", "#{unit.name}-task-completion.csv"

  return this
)

.service("TutorAssessmentCsv", (DoubtfireConstants, $window, currentUser) ->
  this.downloadFile = (unit) ->
    fileDownloaderService.downloadFile "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/tutor_assessments.json?auth_token=#{currentUser.authenticationToken}", "#{unit.name}-tutor-assessments.csv"

  return this
)
