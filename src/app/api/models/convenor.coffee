mod = angular.module("doubtfire.api.models.convenor", [])

.factory("Convenor", (resourcePlus) ->
  resourcePlus "/users/convenors"
)

module.exports = mod.name
