angular.module("doubtfire.api.models.tutor", [])

.factory("Tutor", (resourcePlus) ->
  resourcePlus "/users/tutors"
)
