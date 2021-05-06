angular.module("doubtfire.api.models.task-completion-csv", [])

.service("TaskCompletionCsv", (DoubtfireConstants, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/task_completion.json?auth_token=#{currentUser.authenticationToken}", "_blank"

  return this
)

.service("TutorAssessmentCsv", (DoubtfireConstants, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{DoubtfireConstants.API_URL}/csv/units/#{unit.id}/tutor_assessments.json?auth_token=#{currentUser.authenticationToken}", "_blank"

  return this
)
