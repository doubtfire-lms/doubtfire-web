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
.controller("TimeoutCtrl", ($state, $timeout, auth, currentUser, DoubtfireConstants) ->
  if currentUser?.authenticationToken?
    auth.signOut("#{DoubtfireConstants.API_URL}/auth/#{currentUser.authenticationToken}.json")

  $timeout (-> $state.go "sign_in"), 500
)
