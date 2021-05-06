angular.module("doubtfire.api.models.break", [])

.factory("Break", (resourcePlus) ->
  Break = resourcePlus "/teaching_periods/:teaching_period_id/breaks", { teaching_period_id: "@teaching_period_id" }
  Break
)
