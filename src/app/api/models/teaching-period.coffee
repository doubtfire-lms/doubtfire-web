angular.module("doubtfire.api.models.teaching-period", [])

.factory("TeachingPeriod", (resourcePlus, api, currentUser, alertService) ->
  resource = resourcePlus "/teaching_periods/:id", { id: "@id"}
  rollover = resourcePlus "/teaching_periods/:existing_teaching_period_id/rollover", { existing_teaching_period_id: "@existing_teaching_period_id"}

  data = { }
  data.loadedPeriods = []

  injectFunctionalityInTeachingPeriod = (tp) ->
    unless tp.name?
      tp.name = () ->
        "#{tp.period} #{tp.year}"
      tp.active = () ->
        moment(tp.active_until).diff(moment()) > 0
    tp

  TeachingPeriod = {
    rollover: rollover

    # Get a teaching period with an id, assumes that teaching periods are loaded...
    getTeachingPeriod: (id) ->
      _.find data.loadedPeriods, (tp) -> tp.id == id
    query: (onSuccess, onFailure) ->
      if data.loadedPeriods.length == 0
        resource.query(
          (success) ->
            data.loadedPeriods = _.map success, (tp) -> injectFunctionalityInTeachingPeriod(tp)
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
              data.loadedPeriods[indexOfTeachingPeriods] = injectFunctionalityInTeachingPeriod(updatedTeachingPeriod)
            indexOfTeachingPeriods++
      )

    get: (id, onSuccess, onFailure) ->
      resource.get( {id: id}
        (success) ->
          result = _.find data.loadedPeriods, (tp) -> tp.id == id
          # Fetched teaching period details... update teaching period in loadedPeriods
          if result?
            _.extend result, success
          # If teaching period is not in loadedPeriods
          else
            data.loadedPeriods << success
            result = success
          onSuccess(result)
        (error) ->
          onFailure error
      )
  }

  TeachingPeriod
)
