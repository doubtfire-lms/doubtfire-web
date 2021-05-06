angular.module("doubtfire.api.models.tutorial", [])

.factory("Tutorial", (resourcePlus) ->
  Tutorial = resourcePlus "/tutorials/:id", { id: "@id" }
)
