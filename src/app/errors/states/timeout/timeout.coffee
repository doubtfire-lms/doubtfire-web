#
# Define the timeout state
#
mod = angular.module("doubtfire.errors.states.timeout", [])

.config((headerServiceProvider) ->
  stateData =
    url: "/timeout?dest&params"
    views:
      main:
        controller: "TimeoutCtrl"
        template: require('./timeout.tpl.html')
    data:
      pageTitle: "_Timeout_"
  headerServiceProvider.state "timeout", stateData, 'ErrorHeaderCtrl'
)
.controller("TimeoutCtrl", ($scope, $timeout, api, auth, redirectService, currentUser) ->
  doRedirect = () ->
    redirectService.redirect "home", {}

  if auth.isAuthenticated()
    auth.signOut api + "/auth/" + currentUser.authenticationToken + ".json"
    $timeout doRedirect, 2000
)

module.exports = mod.name
