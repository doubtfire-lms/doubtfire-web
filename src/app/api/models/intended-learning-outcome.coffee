mod = angular.module("doubtfire.api.models.intended-learning-outcome", [])

.factory("IntendedLearningOutcome", (resourcePlus, api, currentUser) ->
  IntendedLearningOutcome = resourcePlus "/units/:unit_id/outcomes/:id", { id: "@id", unit_id: "@unit_id" }

  IntendedLearningOutcome.getOutcomeBatchUploadUrl = (unit) ->
    "#{api}/units/#{unit.id}/outcomes/csv?auth_token=#{currentUser.authenticationToken}"

  IntendedLearningOutcome
)

module.exports = mod.name
