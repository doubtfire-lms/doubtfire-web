angular.module("doubtfire.api.models.user", [])

.factory("User", (resourcePlus, DoubtfireConstants) ->
  User = resourcePlus "/users/:id", { id: "@id" }
  User.csvUrl = ->
    "#{DoubtfireConstants.API_URL}/csv/users"
  return User
)
