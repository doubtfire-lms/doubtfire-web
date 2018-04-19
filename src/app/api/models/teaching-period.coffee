angular.module("doubtfire.api.models.teaching-period", [])

.factory("TeachingPeriod", (resourcePlus, api, currentUser, alertService) ->
  resource = resourcePlus "/teaching_periods/:id", { id: "@id"}

  data = { }
  data.loadedPeriods = []

  TeachingPeriod = {
    query: () ->
      if data.loadedPeriods.length == 0
        resource.query(
          (success) ->
            data.loadedPeriods = success
          (failure) ->
            alertService.add("danger", "Failed to load teaching periods. #{response?.data?.error}", 6000)
        )
      data
  }

  TeachingPeriod
)
