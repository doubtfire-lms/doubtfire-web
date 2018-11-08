angular.module("doubtfire.api.models.teaching-period", [])

.factory("TeachingPeriod", (resourcePlus, api, currentUser, alertService) ->
  resource = resourcePlus "/teaching_periods/:id", { id: "@id"}
  rollover = resourcePlus "/teaching_periods/:existing_teaching_period_id/rollover", { existing_teaching_period_id: "@existing_teaching_period_id"}

  data = { }
  data.loadedPeriods = []

  TeachingPeriod = {
    rollover: rollover
    query: (onSuccess, onFailure) ->
      if data.loadedPeriods.length == 0
        resource.query(
          (success) ->
            data.loadedPeriods = success
            if onSuccess? && _.isFunction(onSuccess)
              onSuccess(data)
          (failure) ->
            alertService.add("danger", "Failed to load teaching periods. #{failure?.data?.error}", 6000)
            if onFailure? && _.isFunction(onFailure)
              onFailure(failure)
        )
      if onSuccess? && _.isFunction(onSuccess)
        onSuccess(data)
      data
    create: ( { teaching_period: teachingperiod } ) ->
      resource.create( { teaching_period: teachingperiod } )

    update: ( { id: id, teaching_period: teachingperiod } ) ->
      resource.update(
        { id: id, teaching_period: teachingperiod }
        (updatedTeachingPeriod) ->
          indexOfTeachingPeriods = 0
          for teachingperiod in data.loadedPeriods
            if teachingperiod.id == updatedTeachingPeriod.id
              data.loadedPeriods[indexOfTeachingPeriods] = updatedTeachingPeriod
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
