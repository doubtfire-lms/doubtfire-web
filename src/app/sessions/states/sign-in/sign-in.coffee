#
# State for sign in
#
mod = angular.module("doubtfire.sessions.states.sign-in", [])

.config(($stateProvider) ->
  signInStateData =
    url: "/sign_in?dest&params"
    views:
      main:
        controller: "SignInCtrl"
        template: require('./sign-in.tpl.html')
    data:
      pageTitle: "_Sign In_"

  $stateProvider.state "sign_in", signInStateData
)
.controller("SignInCtrl", ($scope, $state, $stateParams, usernameCookie, $timeout, $modal, currentUser, auth, api, alertService, localStorageService, redirectService, rememberDoubtfireCredentialsCookie, doubtfireLoginTimeCookie, AboutDoubtfireModal) ->
  isIE = ->
    window.navigator.appName is "Microsoft Internet Explorer"
  ieVersion = ->
    matches = new RegExp(" MSIE ([0-9].[0-9]);").exec(window.navigator.userAgent)
    return parseInt(matches[1].replace(".0", "")) if matches? and matches.length > 1
    true

  $scope.isIE = isIE() and ieVersion() < 11 # Support IE11

  $scope.session = { remember_me: true }

  # April Fools Easter Egg :-)
  angular.element(document).ready ->
    today = new Date()
    aprilFools =  today.getDate()   is 1 and # first day of the
                  today.getMonth()  is 3     # fourth month (April - zero-based)
    if aprilFools
      h1   = document.querySelector('#sign-in h1.logo')
      logo = h1?.querySelector('i')
      if logo? and h1?
        a = document.createElement('A')
        a.href = "http://www.imdb.com/title/tt0107614/"
        a.title = "Mrs. Doubtfire (1993)"
        lead = document.createElement('P')
        lead.appendChild(document.createTextNode('Happy April Fools Day! 🎉'))
        h1.classList.add 'aprilfools'
        h1.appendChild a
        h1.appendChild lead
        logo.style.backgroundImage = 'url("/assets/images/mrsdoubtfire.png")'
        logo.style.backgroundColor = 'inherit'

  $scope.openAboutModal = ->
    AboutDoubtfireModal.show()

  if auth.isAuthenticated()
    redirectService.redirect "home", {}
  else
    $scope.signIn = ->
      $scope.signingIn = true
      signInFunc = ->
        signInCredentials =
          username: $scope.session.username
          password: $scope.session.password
          remember: $scope.session.remember_me
        auth.signIn(api + "/auth", signInCredentials,
          (response) ->
            if $scope.session.remember_me
              localStorageService.set(usernameCookie, currentUser)
              localStorageService.set(rememberDoubtfireCredentialsCookie, true)
              localStorageService.set(doubtfireLoginTimeCookie, new Date().getTime())
            else
              localStorageService.remove(usernameCookie)
              localStorageService.set(rememberDoubtfireCredentialsCookie, false)
              localStorageService.remove(doubtfireLoginTimeCookie)
            alertService.clearAll()
            redirectService.redirect "home", {}
          (response) ->
            $scope.session.password = ''
            $scope.signingIn = false
            if response.error
              $scope.invalidCredentials = true
              resetInvalidCreds = ->
                $scope.invalidCredentials = false
              $timeout resetInvalidCreds, 300
              alertService.add("warning", "Login failed: " + response.error, 6000)
            else
              alertService.add("danger", "Login failed: Unable to connect to server", 6000)
        )
      $timeout signInFunc, 100
)

module.exports = mod.name
