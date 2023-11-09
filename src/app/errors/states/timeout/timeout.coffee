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
# this can be removed... timeout should just sign out and redirect to login
.controller("TimeoutCtrl", (authenticationService) ->
  authenticationService.signOut(false)
)
