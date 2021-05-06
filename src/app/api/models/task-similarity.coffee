angular.module("doubtfire.api.models.task-similarity", [])

.factory("TaskSimilarity", ($http, DoubtfireConstants, currentUser) ->
  result =
    similarityUrl: (task, match) ->
      "#{DoubtfireConstants.API_URL}/tasks/#{task.id}/similarity/#{match}"

    get: (task, match, callback) ->
      url = result.similarityUrl(task, match)
      $http.get(url).success ( data ) ->
        callback(data)

    put: (task, match, other, value, callback, error_callback) ->
      url = result.similarityUrl(task, match)
      $http.put(url, { dismissed: value, other: other}).then(
        (data) -> callback(data)
        (response) -> error_callback(response))
)
