angular.module("doubtfire.services.analytics", [])
#
# Services for analytics
#
.factory("analyticsService", ($analytics, currentUser) ->
  analyticsService = {}
  #
  # Logs a new event
  #
  # For consistency, use like this:
  #   category: 'Visualisations' (Pluralised)
  #   eventName: 'Refreshed All' (Past-Tense)
  #
  analyticsService.event = (category, eventName, label, value) ->
    # Don't log unless user has opted in
    return unless currentUser.profile.opt_in_to_research
    if value? and typeof value isnt 'Number' and value < 0
      throw new Error "Value needs to be a positive number"
    $analytics.eventTrack eventName, {
      category: category
      label: label
      value: value
    }

  analyticsService.watchEvent = ( scope, toWatch, category, label) ->
    scope.$watch toWatch, (newVal, oldVal) ->
      if newVal? && newVal != oldVal
        if _.isFunction label
          analyticsService.event category, "Changed #{toWatch}", label(newVal)
        else if _.isInteger newVal
          analyticsService.event category, "Changed #{toWatch}", label, newVal
        else
          analyticsService.event category, "Changed #{toWatch}", newVal

  analyticsService
) # end factory
