mod = angular.module("doubtfire.api.models.students", [])

.factory("Students", (resourcePlus) ->
  resourcePlus "/students"
)

module.exports = mod.name
