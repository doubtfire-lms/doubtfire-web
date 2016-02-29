angular.module("doubtfire.api.models.task-completion-CSV", [])

.service("TaskCompletionCSV", (api, $window, currentUser) ->
  this.downloadFile = (unit) ->
    $window.open "#{api}/csv/units/#{unit.id}/task_completion.json?auth_token=#{currentUser.authenticationToken}", "_blank"

  return this
)
