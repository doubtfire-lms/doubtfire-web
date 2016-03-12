angular.module("doubtfire.errors.states.unauthorised", [])

#
# Define the unauthorised state
#
.config((headerServiceProvider) ->
  stateData =
    url: "/unauthorised"
    views:
      main:
        controller: "UnauthorisedCtrl"
        templateUrl: "errors/states/unauthorised/unauthorised.tpl.html"
    data:
      pageTitle: "_Unauthorised_"

  headerServiceProvider.state "unauthorised", stateData
)

.controller("UnauthorisedCtrl", ($scope) ->)
