angular.module("doubtfire.api.models.unit-role", [])

.factory("UnitRole", (resourcePlus) ->
  resourcePlus "/unit_roles/:id", { id: "@id" }
)
