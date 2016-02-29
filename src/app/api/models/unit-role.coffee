angular.module("doubtfire.api.models.unit-roles", [])

.factory("UnitRole", (resourcePlus) ->
  resourcePlus "/unit_roles/:id", { id: "@id" }
)
