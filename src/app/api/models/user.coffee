angular.module("doubtfire.api.models.user", [])

.factory("User", (resourcePlus, currentUser, DoubtfireConstants) ->
  User = resourcePlus "/users/:id", { id: "@id" }
  User.csvUrl = ->
    "#{DoubtfireConstants.API_URL}/csv/users?auth_token=#{currentUser.authenticationToken}"
  return User
)
