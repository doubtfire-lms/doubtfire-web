angular.module("doubtfire.api.models.rollover-unit", [])

.factory("RolloverUnit", (resourcePlus, api, currentUser) ->
  DuplicatedUnit = resourcePlus "/units/:id/rollover", { id: "@id" }

  return DuplicatedUnit
)
