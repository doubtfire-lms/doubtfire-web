angular.module("doubtfire.api.models.rollover-unit", [])

.factory("RolloverUnit", (resourcePlus) ->
  DuplicatedUnit = resourcePlus "/units/:id/rollover", { id: "@id" }

  return DuplicatedUnit
)
