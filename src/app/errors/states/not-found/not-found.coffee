angular.module("doubtfire.errors.states.not-found", [])

#
# Define the not found state
#
.config(($stateProvider) ->
  stateData =
    url: "/not_found"
    views:
      main:
        controller: "NotFoundCtrl"
        templateUrl: "errors/states/not-found/not-found.tpl.html"
    data:
      pageTitle: "_Not Found_"
  $stateProvider.state 'not_found', stateData
)

.controller("NotFoundCtrl", ($scope, GlobalStateService) ->
  GlobalStateService.setView("OTHER")
)
