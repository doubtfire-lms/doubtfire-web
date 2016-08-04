mod = angular.module("doubtfire.api.models.task-similarity", [])

.factory("TaskSimilarity", ($http, api, currentUser) ->
  get: (task, match, callback) ->
    url = "#{api}/tasks/#{task.id}/similarity/#{match}"
    $http.get(url).success ( data ) ->
      callback(data)
)

module.exports = mod.name
