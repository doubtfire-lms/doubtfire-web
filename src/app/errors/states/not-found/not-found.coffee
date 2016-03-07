angular.module("doubtfire.errors.states.not-found", [])

#
# Define the not found state
#
.config((headerServiceProvider) ->
  stateData =
    url: "/not_found"
    views:
      main:
        controller: "NotFoundCtrl"
        templateUrl: "errors/states/not-found/not-found.tpl.html"
    data:
      pageTitle: "_Not Found_"
  headerServiceProvider.state 'not_found', stateData
)

.controller("NotFoundCtrl", ($scope) ->)
