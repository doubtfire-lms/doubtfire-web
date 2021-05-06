angular.module("doubtfire.common.services.listener", [])

.factory("listenerService", ->
  listeners = {}
  listenerService = {}
  listenerService.listenTo = (scope) ->
    listeners[scope.$id] ?= []
    scope.$on '$destroy', -> _.each(listeners[scope.$id], (l) -> l())
    listeners[scope.$id]
  listenerService
)
