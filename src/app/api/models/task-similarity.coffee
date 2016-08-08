angular.module("doubtfire.api.models.task-similarity", [])

.factory("TaskSimilarity", ($http, api, currentUser) ->
  result =
    similarityUrl: (task, match) ->
      "#{api}/tasks/#{task.id}/similarity/#{match}"

    get: (task, match, callback) ->
      url = result.similarityUrl(task, match)
      $http.get(url).success ( data ) ->
        callback(data)
)
