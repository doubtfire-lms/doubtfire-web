angular.module("doubtfire.sessions.states.sign-in", [])

#
# State for sign in
#
.config(($stateProvider) ->
  signInStateData =
    url: "/sign_in?dest&params&authToken"
    views:
      main:
        controller: "SignInCtrl"
        templateUrl: "sessions/states/sign-in/sign-in.tpl.html"
    data:
      pageTitle: "_Sign In_"

  $stateProvider.state "sign_in", signInStateData
)

.controller("SignInCtrl", ($scope, $state, $stateParams, DoubtfireConstants, usernameCookie, $timeout, $http, $modal, currentUser, auth, alertService, localStorageService, rememberDoubtfireCredentialsCookie, doubtfireLoginTimeCookie, AboutDoubtfireModal) ->

  isIE = ->
    window.navigator.appName is "Microsoft Internet Explorer"
  ieVersion = ->
    matches = new RegExp(" MSIE ([0-9].[0-9]);").exec(window.navigator.userAgent)
    return parseInt(matches[1].replace(".0", "")) if matches? and matches.length > 1
    true

  $scope.isIE = isIE() and ieVersion() < 11 # Support IE11

  $scope.session = { remember_me: true }

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  # Check for AAF login
  $scope.api = DoubtfireConstants.API_URL
  timeoutPromise = $timeout (-> $scope.waitingAWhile = true), 1500
  $http.get("#{DoubtfireConstants.API_URL}/auth/method").then ((response) ->
    $scope.aafLogin = response.data.redirect_to || false

    if $scope.aafLogin
      if $stateParams.authToken
        # This is AAF and we just got an auth_token? Must request to sign in
        $scope.signIn({ auth_token: $stateParams.authToken })
      else
        # We are AAF and no auth token so we can must redirect to AAF login provider
        window.location.assign($scope.aafLogin)
    else
      $scope.authMethodLoaded = true
      $timeout.cancel(timeoutPromise)
    ), ((err) ->
      $scope.authMethodFailed = true
      $scope.error = err
      $timeout.cancel(timeoutPromise)
    )

  # April Fools Easter Egg :-)
  angular.element(document).ready ->
    # This would make absolutely no sense unless the external name is Doubtfire!
    return if DoubtfireConstants.ExternalName.value isnt 'Doubtfire'
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
    $state.go "home"
  else
    $scope.signIn = (signInCredentials) ->
      $scope.signingIn = true
      signInFunc = ->
        signInCredentials ?=
          username: $scope.session.username
          password: $scope.session.password
          remember: $scope.session.remember_me
        auth.signIn("#{DoubtfireConstants.API_URL}/auth", signInCredentials,
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
            $state.go "home", {}
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
