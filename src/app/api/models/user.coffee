angular.module("doubtfire.api.models.user", [])

.factory("User", (resourcePlus, currentUser, api) ->
  User = resourcePlus "/users/:id", { id: "@id" }
  User.csvUrl = ->
    "#{api}/csv/users?auth_token=#{currentUser.authenticationToken}"
  return User
)
