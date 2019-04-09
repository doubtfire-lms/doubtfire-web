angular.module("doubtfire.sessions.states.sign-out", [])

#
# State for sign out
#
.config(($stateProvider) ->
  signOutStateData =
    url: "/sign_out"
    views:
      main:
        controller: "SignOutCtrl"
        templateUrl: "sessions/states/sign-out/sign-out.tpl.html"
    data:
      pageTitle: "_Sign Out_"
  $stateProvider.state "sign_out", signOutStateData
)
.controller("SignOutCtrl", ($state, $timeout, $http, auth, api, currentUser) ->
  if auth.signOut api + "/auth/" + currentUser.authenticationToken + ".json"
    $http.get("#{api}/auth/signout_url").then ((response) ->
      signoutURL = response.data.auth_signout_url || false
      if signoutURL
        window.location.assign(signoutURL)
      else
        $timeout (-> $state.go "sign_in"), 750
    )
  return this
)
