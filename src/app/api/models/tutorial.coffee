mod = angular.module("doubtfire.api.models.tutorial", [])

.factory("Tutorial", (resourcePlus) ->
  resourcePlus "/tutorials/:id", { id: "@id" }
)

module.exports = mod.name
