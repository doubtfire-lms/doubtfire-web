angular.module("doubtfire.api.models.task-completion-csv", [])

.service("TaskCompletionCsv", (api, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}/task_completion.json?auth_token=#{currentUser.authenticationToken}", "_blank"

  return this
)

.service("TutorAssessmentCsv", (api, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}/tutor_assessments.json?auth_token=#{currentUser.authenticationToken}", "_blank"

  return this
)
