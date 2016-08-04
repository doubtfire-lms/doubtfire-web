#
# State for sign out
#
mod = angular.module("doubtfire.sessions.states.sign-out", [])

.config(($stateProvider) ->
  signOutStateData =
    url: "/sign_out"
    views:
      main:
        controller: "SignOutCtrl"
        template: require('./sign-out.tpl.html')
    data:
      pageTitle: "_Sign Out_"
  $stateProvider.state "sign_out", signOutStateData
)
.controller("SignOutCtrl", ($state, $timeout, auth, api, currentUser) ->
  if auth.signOut api + "/auth/" + currentUser.authenticationToken + ".json"
    $timeout (-> $state.go "sign_in"), 750
  return this
)

module.exports = mod.name
