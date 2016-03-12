angular.module("doubtfire.api.models.user-role", [])

.factory("UserRole", (resourcePlus) ->
  resourcePlus "/user_roles/:id", { id: "@id" }
)
