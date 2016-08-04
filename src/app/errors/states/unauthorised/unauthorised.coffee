#
# Define the unauthorised state
#
mod = angular.module("doubtfire.errors.states.unauthorised", [])

.config((headerServiceProvider) ->
  stateData =
    url: "/unauthorised"
    views:
      main:
        controller: "UnauthorisedCtrl"
        template: require('./unauthorised.tpl.html')
    data:
      pageTitle: "_Unauthorised_"

  headerServiceProvider.state "unauthorised", stateData
)

.controller("UnauthorisedCtrl", ($scope) ->)

module.exports = mod.name
