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
            alertService.add("danger", "Failed to load teaching periods. #{failure?.data?.error}", 6000)
        )
      data
    
    create: ( { teaching_period: teachingperiod } ) ->
      resource.create( { teaching_period: teachingperiod } )

    update: ( { id: id, teaching_period: teachingperiod } ) ->
      resource.update( { id: id, teaching_period: teachingperiod } )
    
    get: (id, onSuccess, onFailure) ->
      resource.get(
        {id: id}
        (success) ->
          match = _.find data.loadedPeriods.id == success.id

          if match?
            _.extend match, success
            onSuccess match
          else
            data.loadedPeriods << success
            onSuccess success
        (error) ->
          onFailure error
      )
  }

  TeachingPeriod
)
