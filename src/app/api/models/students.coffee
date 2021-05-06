angular.module("doubtfire.api.models.students", [])

.factory("Students", (resourcePlus) ->
  resourcePlus "/students"
)
