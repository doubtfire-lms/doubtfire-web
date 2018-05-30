angular.module("doubtfire.errors.states.timeout", [])

#
# Define the timeout state
#
.config(($stateProvider) ->
  stateData =
    url: "/timeout?dest&params"
    views:
      main:
        controller: "TimeoutCtrl"
        templateUrl: "errors/states/timeout/timeout.tpl.html"
    data:
      pageTitle: "_Timeout_"
  $stateProvider.state "timeout", stateData, 'TimeoutCtrl'
)
.controller("TimeoutCtrl", ($scope, $timeout, api, auth, currentUser, $state) ->
  $state.go("sign_out")
)
