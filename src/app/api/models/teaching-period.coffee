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
      resource.update(
        { id: id, teaching_period: teachingperiod }
        (teachingPeriod) ->
          indexOfTeachingPeriods = 0
          for teachingperiod in data.loadedPeriods
            if teachingperiod.id == teachingPeriod.id
              data.loadedPeriods[indexOfTeachingPeriods] = teachingPeriod
            indexOfTeachingPeriods++
      )
    
    get: (id, onSuccess, onFailure) ->
      resource.get(
        {id: id}
        (success) ->
          indexOfTeachingPeriods = 0
          for teachingperiod in data.loadedPeriods
            if teachingperiod.id == success.id
              onSuccess data.loadedPeriods[indexOfTeachingPeriods]
            else
              data.loadedPeriods << success
              onSuccess success
        
            indexOfTeachingPeriods++
        (error) ->
          onFailure error
      )
  }

  TeachingPeriod
)
