angular.module("doubtfire.api.models.intended-learning-outcome", [])

.factory("IntendedLearningOutcome", (resourcePlus, DoubtfireConstants, currentUser) ->
  IntendedLearningOutcome = resourcePlus "/units/:unit_id/outcomes/:id", { id: "@id", unit_id: "@unit_id" }

  IntendedLearningOutcome.getOutcomeBatchUploadUrl = (unit) ->
    "#{DoubtfireConstants.API_URL}/units/#{unit.id}/outcomes/csv?auth_token=#{currentUser.authenticationToken}"

  IntendedLearningOutcome
)
