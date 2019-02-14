angular.module("doubtfire.api.models.unit-request", [])

.factory("UnitRequest", (resourcePlus) ->
  resourcePlus "/unitrequests"
)